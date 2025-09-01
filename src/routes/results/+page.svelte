<script lang="ts">
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import SaveReportDialog from '$lib/components/SaveReportDialog.svelte';
  import JobRewrite from '$lib/components/JobRewrite.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { toast } from 'svelte-sonner';
  import { page } from '$app/stores';
  import { formatReportForDB } from '$lib/utils/reportMapper';

  import { auditStore } from '$lib/stores/audit.js';
  import { user } from '$lib/stores/auth.js';
  import type { Report } from '$lib/types/report';
  import { get } from 'svelte/store';

  let auditResults: Report | null = null;
  let showDialog = false;
  let dialogTimeout;
  let isLoggedIn = false;
  let showSuccessMessage = false;
  let successMessageTimeout;
  let rewriteData: any = null;
  let rewriteLoading = false;
  let loading = false;
  let results = null;
  let lastReportId: string | null = null;
  let reportId: string | null = null;
  let isLoadingReport = false;
  let pendingReportId: string | null = null;

  // Check if we just logged in from a guest session
  let fromGuestLogin = false;
  if (browser) {
    const params = new URLSearchParams(window.location.search);
    fromGuestLogin = params.get('from') === 'guest-login';
  }

  // Queued loader to avoid overlapping async work from reactive changes
  function queueLoadReportById(id) {
    if (!id) return;
    const currentId = auditResults?.id ?? (auditResults && (auditResults).report_id);
    if (id === lastReportId || id === currentId) {
      lastReportId = id;
      return;
    }
    if (isLoadingReport) {
      pendingReportId = id;
      return;
    }
    isLoadingReport = true;
    const requestedId = id;
    loadReportById(requestedId)
      .then(() => {
        lastReportId = requestedId;
      })
      .finally(async () => {
        isLoadingReport = false;
        if (pendingReportId && pendingReportId !== lastReportId) {
          const nextId = pendingReportId;
          pendingReportId = null;
          isLoadingReport = true;
          try {
            await loadReportById(nextId);
            lastReportId = nextId;
          } finally {
            isLoadingReport = false;
          }
        }
      });
  }

  function clearGuestCache() {
    try {
      localStorage.removeItem('guest_audit_report');
      localStorage.removeItem('guest_audit_report_ts');
      if (import.meta.env.DEV) console.log('[results] Cleared guest report cache after guest-login');
    } catch (e) {
      console.warn('[results] Failed clearing localStorage guest report cache', e);
    }
  }

  // Guest report helpers
  function setGuestReport(report) {
    try {
      localStorage.setItem('guest_audit_report', JSON.stringify(report));
      localStorage.setItem('guest_audit_report_ts', Date.now().toString());
      return true;
    } catch (e) {
      console.error('LocalStorage fallback failed:', e);
      return false;
    }
  }

  function getGuestReport() {
    try {
      const raw = localStorage.getItem('guest_audit_report');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading guest report:', e);
      return null;
    }
  }

  // Proactively clear any stale guest report cache when arriving from guest-login
  onMount(() => {
    if (fromGuestLogin) {
      clearGuestCache();
    }

    // Subscribe to audit store (for non-logged-in/guest flows)
    const unsubscribe = auditStore.subscribe(state => {
      auditResults = state.results;
    });

    // User store subscription
    let userVal = null;
    const unsubUser = user.subscribe(val => {
      userVal = val;
      isLoggedIn = !!(val && val.id);
    });

    // Load guest report from localStorage if not logged in
    if (!auditResults && !isLoggedIn) {
      const guest = getGuestReport();
      if (guest) {
        auditResults = guest;
        if (import.meta.env.DEV) console.log('Loaded guest report from localStorage');
      }
    }

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const reportId = urlParams.get('report');
    
    // Priority 1: Load specific report if report ID is provided
    if (reportId && isLoggedIn) {
      loadReportById(reportId);
    }
    // Priority 2: For normal visits, just prompt guests to save (no auto-save)
    else {
      gentlyPromptSave();
    }

    // Add a subscription to the page store to react to URL changes
    const unsubscribePage = page.subscribe(($page) => {
      const rid = $page.url.searchParams.get('report');
      if (isLoggedIn && rid) {
        queueLoadReportById(rid);
      } else {
        gentlyPromptSave();
      }
    });

    // Cleanup function to be returned at the end
    return () => {
      clearTimeout(dialogTimeout);
      unsubUser();
      unsubscribe();
      unsubscribePage(); // Unsubscribe the page subscription
    };
  });

  // Add this reactive statement to handle auth state changes and URL parameters
  $: if (browser && isLoggedIn) {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('report');
    if (reportId && !auditResults) {
      queueLoadReportById(reportId);
    }
  }

  // Updated saveReport function
  async function saveReport(report: any) {
    if (!report) return;
  
    try {
      // Get current user once; no temporary subscription needed
      const currentUser = get(user);
      const userId = currentUser?.id ?? null;
      const formattedReport = formatReportForDB(report, userId);
    
      const { data, error } = await supabase
        .from('reports')
        .insert([formattedReport])
        .select('id, json_ld, job_title, job_body, feedback, total_score')
        .single();
      
      if (error) throw error;
  
      if (import.meta.env.DEV) console.log('Report saved successfully with ID:', data.id);
    
      // Update store and local variables
      auditStore.update(state => ({
        ...state,
        results: {
          ...(state?.results || {}),
          ...data
        }
      }));
    
      // Update local references
      auditResults = {...auditResults, ...data};
      if (results) results = {...results, ...data};
    
      // Remove guest cache if exists
      if (!isLoggedIn) {
        localStorage.removeItem('guest_audit_report');
        localStorage.removeItem('guest_audit_report_ts');
      }
  
      return true;
    } catch (err) {
      console.error('Error saving report:', err);
  
      // Fallback to localStorage for guests
      if (!isLoggedIn) {
        return setGuestReport(report);
      }
      return false;
    }
  }

  // Show success message for a few seconds then fade out
  function showSavedMessage() {
    // Clear any existing timeout
    if (successMessageTimeout) {
      clearTimeout(successMessageTimeout);
    }
    
    // Show the message
    showSuccessMessage = true;
    
    // Hide after 3 seconds
    successMessageTimeout = setTimeout(() => {
      showSuccessMessage = false;
    }, 3000);
  }
  
  // Show dialog after delay for guests only - no auto-save for logged-in users
  function gentlyPromptSave() {
    if (!auditResults) return;
    
    // Only show dialog for guests, no auto-save
    if (!isLoggedIn) {
      // Show dialog after delay for guests
      dialogTimeout = setTimeout(() => {
        if (import.meta.env.DEV) console.log('Timed prompt: Setting showDialog to true');
        showDialog = true;
      }, 6000); // 6 seconds
    }
    // No auto-save for logged-in users to prevent duplicative database entries
  }

  // Manual trigger for Save/Export/Access Later
  async function triggerSaveDialog(event) {
    if (import.meta.env.DEV) console.log('Save dialog triggered:', event.type || 'direct call');
    
    if (isLoggedIn) {
      // For logged-in users, save directly
      const saved = await saveReport(auditResults || results);
      if (saved) showSavedMessage();
    } else {
      // For guests, show the dialog
      showDialog = true;
      if (import.meta.env.DEV) console.log('Dialog should be showing now, showDialog =', showDialog);
    }
  }

  // Handle magic link submission from SaveReportDialog
  async function handleMagicLink(event: any) {
    const { email, report } = event.detail;
    try {
      // In production, this would use the real Supabase client
      // The MagicLinkLogin component now handles sending the magic link
      
      // Save the report to localStorage so it can be associated with the user after login
      if (report) setGuestReport(report);
      
      // Show success message
      toast.success('Magic link sent! Check your email.');
    } catch (error) {
      console.error('Error handling magic link submission:', error);
      toast.error('Failed to save report. Please try again.');
    }
  }

  // Button handler functions
  function downloadReport() {
    if (!auditResults) {
      toast.error('No report data available');
      return;
    }
    
    // Trigger browser print dialog
    window.print();
  }

  function downloadJobData() {
    if (!auditResults) {
      toast.error('No report data available');
      return;
    }
    
    try {
      // Extract JSON-LD data from the report
      const jsonLdData = (auditResults as any).json_ld || (auditResults as any).jsonLd || {};
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(jsonLdData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-posting-data-${auditResults.id || Date.now()}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success('JSON-LD data downloaded successfully');
    } catch (error) {
      console.error('Error downloading JSON-LD data:', error);
      toast.error('Failed to download JSON-LD data');
    }
  }

  function handleRewrite() {
    if (!auditResults) {
      toast.error('No report data available');
      return;
    }
    
    // Set rewrite data to trigger the JobRewrite component
    rewriteData = {
      original_text: auditResults.job_body || (auditResults as any).jobBody || '',
      improvedText: '', // Will be populated by the rewrite API
      recommendations: auditResults.feedback || {},
      score: auditResults.overallScore || (auditResults as any).total_score || 0,
      id: auditResults.id || ''
    };
  }
  
  function handleBackToResults() {
    rewriteData = null;
  }


  // Function to load a specific report by ID from the database
  async function loadReportById(reportId: string) {
    if (!reportId || typeof reportId !== 'string') {
      console.error('Cannot load report - no ID provided');
      toast.error('Invalid report reference');
      return false;
    }
    
    try {
      if (import.meta.env.DEV) console.log('Loading report by ID:', reportId);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();
        
      if (error) {
        console.error('Error loading report:', error);
        toast.error('Could not load the requested report');
        return false;
      }
      
      if (data) {
        if (import.meta.env.DEV) console.log('Successfully loaded report:', data.id);
        
        // Update the audit store with the loaded report
        auditStore.update(state => ({
          ...state,
          results: data
        }));
        
        // Update local variable
        auditResults = data;
        
        return true;
      } else {
        console.warn('No report found with ID:', reportId);
        toast.error('Report not found');
        return false;
      }
    } catch (err) {
      console.error('Exception loading report:', err);
      toast.error('Error loading report');
      return false;
    }
  }
  // Removed reactive async block; loading handled via page.subscribe

  // Dummy data following new API response format
  const defaultResults = {
    job_title: "Senior Frontend Developer",
    job_body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    timestamp: "2025-06-24T12:00:00Z",
    total_score: 82,
    categories: {
      clarity: { score: 16, maxScore: 20, suggestions: ["Shorten sentences"] },
      promptAlignment: { score: 18, maxScore: 20, suggestions: ["Group skills more logically"] },
      structuredData: { score: 11, maxScore: 15, suggestions: ["Add schema.org/JobPosting JSON-LD"] },
      recency: { score: 8, maxScore: 10, suggestions: [] },
      keywordTargeting: { score: 13, maxScore: 15, suggestions: ["Add more relevant keywords"] },
      compensation: { score: 8, maxScore: 10, suggestions: ["Include salary range"] },
      pageContext: { score: 8, maxScore: 10, suggestions: [] }
    },
    red_flags: ["structuredData"],
    recommendations: [
      "Add schema.org/JobPosting JSON-LD for better visibility",
      "Include a salary range for transparency",
      "Group skills and requirements more logically",
      "Shorten overly long sentences"
    ],
    feedback: "The job posting is clear in terms of specifying required skills, experience, and education. However, the clarity could be improved by shortening sentences and grouping requirements more logically. Adding structured data and a salary range would further increase visibility and transparency."
  };

</script>

<div class="results-page-container relative z-10 print:bg-white">
  <!-- Success message toast notification -->
  {#if showSuccessMessage}
    <div class="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-opacity duration-300 z-50 max-w-sm print:hidden">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <p>Report saved successfully!</p>
      </div>
    </div>
  {/if}
  
  <div class="pt-16  relative z-10 print:pt-0"> <!-- Add padding to account for the fixed navbar -->
    {#if rewriteData}
      <button 
        class="back-button" 
        on:click={handleBackToResults}
        on:keydown={(e) => e.key === 'Enter' && handleBackToResults()}
      >
        ← Back to Results
      </button>
      <JobRewrite 
        original_text={rewriteData.original_text} 
        improvedText={rewriteData.improvedText}
        recommendations={rewriteData.recommendations}
        score={rewriteData.score}
        jobId={rewriteData.id}
      />
    {:else if isLoadingReport}  <!-- Show loading indicator when loading -->
      <div class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-gray-500">Loading report...</p>
      </div>
    {:else if auditResults}
      <!-- Use actual results from audit store if available -->
      <ResultsDisplay 
        results={auditResults as any} 
        visible={true} 
        isLoggedIn={isLoggedIn}
        rewriteLoading={rewriteLoading}
        loading={loading}
        on:save={triggerSaveDialog}
        {downloadReport}
        {downloadJobData}
        {handleRewrite}
      />
      <SaveReportDialog
        bind:open={showDialog}
        report={auditResults}
        on:submit={handleMagicLink}
      />
    {:else if browser && (new URLSearchParams(window.location.search).get('from') === 'default')}
      <!-- Only show default data if URL contains ?from=default -->
      <ResultsDisplay results={defaultResults as any} visible={true} />
    {:else}
      <!-- Show nothing or a friendly message if no data -->
      <div class="text-center text-gray-500 py-16">
        No audit results to display. Please run an audit first.
      </div>
    {/if}
  </div>
</div>

<style>
  .results-page-container {
    width: 100%;
    min-height: 100vh;
    /* background-color: #ffffff; */
  }

  @media print {
    .results-page-container {
      min-height: auto;
      background: #ffffff !important;
      padding: 0 !important;
    }
  }
</style>
