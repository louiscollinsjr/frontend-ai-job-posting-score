<script lang="ts">
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import SaveReportDialog from '$lib/components/SaveReportDialog.svelte';
  import JobRewrite from '$lib/components/JobRewrite.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { toast } from 'svelte-sonner';

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
  let rewriteData = null;
  let results = null;

  // Format report data to match the database schema (component scope)
  function formatReportForDB(report: any, userId: string | null): any {
    const safeParse = (maybeJson: any, fallback: any) => {
      try {
        if (typeof maybeJson === 'string') return JSON.parse(maybeJson);
        if (maybeJson == null) return fallback;
        return maybeJson;
      } catch {
        return fallback;
      }
    };

    // Ensure jsonb/object types
    const parsedCategories = safeParse(report?.categories, {});
    const categories = parsedCategories && typeof parsedCategories === 'object' && !Array.isArray(parsedCategories)
      ? parsedCategories
      : {};

    const parsedRecommendations = safeParse(report?.recommendations, []);
    const recommendations = Array.isArray(parsedRecommendations) ? parsedRecommendations : [];

    const parsedRedFlags = safeParse(report?.red_flags, []);
    const red_flags = Array.isArray(parsedRedFlags) ? parsedRedFlags : [];

    // Ensure jsonb column gets an object, not a string
    const original_report = safeParse(report?.original_report ?? report, {});

    // Ensure all required fields are present and match DB schema
    return {
      userid: userId,
      job_title: report?.job_title || 'Untitled Job',
      job_body: report?.job_body || report?.content || '',
      feedback: report?.feedback || '',
      total_score: report?.total_score || 0,
      categories,
      recommendations,
      red_flags,
      savedat: new Date().toISOString(),
      source: report?.source || 'web_app',
      original_text: report?.job_body || report?.content || '',
      original_report
    };
  }

  // Check if we just logged in from a guest session
  let fromGuestLogin = false;
  if (browser) {
    const params = new URLSearchParams(window.location.search);
    fromGuestLogin = params.get('from') === 'guest-login';
  }

  // Proactively clear any stale guest report cache when arriving from guest-login
  onMount(() => {
    if (fromGuestLogin) {
      try {
        localStorage.removeItem('guest_audit_report');
        localStorage.removeItem('guest_audit_report_ts');
        // Optional: clear any old last_job_id that might interfere
        // localStorage.removeItem('last_job_id');
        console.log('[results] Cleared guest report cache after guest-login');
      } catch (e) {
        console.warn('[results] Failed clearing localStorage guest report cache', e);
      }
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
      try {
        const guestReport = localStorage.getItem('guest_audit_report');
        if (guestReport) {
          auditResults = JSON.parse(guestReport);
          console.log('Loaded guest report from localStorage');
        }
      } catch (e) {
        console.error('Error loading guest report:', e);
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
    // Priority 2: Clear guest cache after login
    else if (fromParam === 'guest-login') {
      console.log('[localStorage] Clearing guest reports after login');
      try {
        localStorage.removeItem('guest_audit_report');
        localStorage.removeItem('guest_audit_report_ts');
      } catch (e) {
        console.warn('Failed to clear guest reports:', e);
      }
    }
    // Priority 3: For normal visits, just prompt guests to save (no auto-save)
    else {
      gentlyPromptSave();
    }

    // Cleanup function to be returned at the end
    return () => {
      clearTimeout(dialogTimeout);
      unsubUser();
    };
  });

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
    
      console.log('Report saved successfully with ID:', data.id);
    
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
        try {
          localStorage.setItem('guest_audit_report', JSON.stringify(report));
          return true;
        } catch (e) {
          console.error('LocalStorage fallback failed:', e);
        }
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
        console.log('Timed prompt: Setting showDialog to true');
        showDialog = true;
      }, 6000); // 6 seconds
    }
    // No auto-save for logged-in users to prevent duplicative database entries
  }

  // Manual trigger for Save/Export/Access Later
  async function triggerSaveDialog(event) {
    console.log('Save dialog triggered:', event.type || 'direct call');
    
    if (isLoggedIn) {
      // For logged-in users, save directly
      const saved = await saveReport(auditResults || results);
      if (saved) showSavedMessage();
    } else {
      // For guests, show the dialog
      showDialog = true;
      console.log('Dialog should be showing now, showDialog =', showDialog);
    }
  }

  // Handle magic link submission from SaveReportDialog
  async function handleMagicLink(event) {
    const { email, report } = event.detail;
    try {
      // In production, this would use the real Supabase client
      // The MagicLinkLogin component now handles sending the magic link
      
      // Save the report to localStorage so it can be associated with the user after login
      if (report) {
        localStorage.setItem('guest_audit_report', JSON.stringify(report));
        localStorage.setItem('guest_audit_report_ts', Date.now().toString());
      }
      
      // Show success message
      toast.success('Magic link sent! Check your email.');
    } catch (error) {
      console.error('Error handling magic link submission:', error);
      toast.error('Failed to save report. Please try again.');
    }
  }

  function handleRewrite(event) {
    rewriteData = event.detail;
  }
  
  function handleBackToResults() {
    rewriteData = null;
  }

  import { page } from '$app/stores';

  // Function to load a specific report by ID from the database
  async function loadReportById(reportId) {
    if (!reportId || typeof reportId !== 'string') {
      console.error('Cannot load report - no ID provided');
      toast.error('Invalid report reference');
      return false;
    }
    
    try {
      console.log('Loading report by ID:', reportId);
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
        console.log('Successfully loaded report:', data.id);
        
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

<div class="results-page-container relative z-10">
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
  
  <div class="pt-16  relative z-10"> <!-- Add padding to account for the fixed navbar -->
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
    {:else if auditResults}
      <!-- Use actual results from audit store if available -->
      <ResultsDisplay 
        results={auditResults} 
        visible={true} 
        isLoggedIn={isLoggedIn}
        on:save={() => triggerSaveDialog({type: 'save'})} 
        on:export={() => triggerSaveDialog({type: 'export'})} 
        on:accesslater={() => triggerSaveDialog({type: 'accesslater'})} 
        on:tips={() => triggerSaveDialog({type: 'tips'})} 
        on:rewrite={handleRewrite}
      />
      <SaveReportDialog
        bind:open={showDialog}
        report={auditResults}
        on:submit={handleMagicLink}
      />
    {:else if browser && (new URLSearchParams(window.location.search).get('from') === 'default')}
      <!-- Only show default data if URL contains ?from=default -->
      <ResultsDisplay results={defaultResults} visible={true} />
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
</style>
