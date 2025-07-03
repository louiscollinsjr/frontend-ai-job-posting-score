<script lang="ts">
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import SaveReportDialog from '$lib/components/SaveReportDialog.svelte';
    import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { toast } from 'svelte-sonner';

  import { auditStore } from '$lib/stores/audit.js';
  import { user } from '$lib/stores/auth.js';
  import type { Report } from '$lib/types/report';

  let auditResults: Report | null = null;
  let showDialog = false;
  let dialogTimeout;
  let isLoggedIn = false;
  let showSuccessMessage = false;
  let successMessageTimeout;

  // Check if we just logged in from a guest session
  let fromGuestLogin = false;
  if (browser) {
    const params = new URLSearchParams(window.location.search);
    fromGuestLogin = params.get('from') === 'guest-login';
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

  // Format report data to match the database schema
  function formatReportForDB(report: any, userId: string): any {
    // Ensure all required fields are present
    return {
      userId: userId,
      jobTitle: report.jobTitle || 'Untitled Job',
      jobBody: report.jobBody || report.content || '',
      feedback: report.feedback || '',
      totalScore: report.totalScore || 0,
      categories: report.categories || {},
      recommendations: report.recommendations || [],
      redFlags: report.redFlags || [],
      savedAt: new Date().toISOString(),
      source: report.source || 'web_app',
      // Store the original report JSON for future use
      originalReport: JSON.stringify(report)
    };
  }

  // Save report to localStorage for guests or to database for logged-in users
  async function saveReport(report: any) {
    if (!report) return;
    
    if (isLoggedIn && userVal?.id) {
      try {
        // Format the report to match the database schema
        const formattedReport = formatReportForDB(report, userVal.id);
        console.log('Saving formatted report to Supabase:', formattedReport);
        
        // Ensure JSON fields are properly formatted
        const dbReport = {
          ...formattedReport,
          // Convert to proper JSON format for Supabase
          categories: typeof formattedReport.categories === 'string' 
            ? JSON.parse(formattedReport.categories) 
            : formattedReport.categories,
          recommendations: Array.isArray(formattedReport.recommendations) 
            ? formattedReport.recommendations 
            : [],
          redFlags: Array.isArray(formattedReport.redFlags) 
            ? formattedReport.redFlags 
            : [],
          // Store original as string in case it's already stringified
          originalReport: typeof formattedReport.originalReport === 'string' 
            ? formattedReport.originalReport 
            : JSON.stringify(formattedReport)
        };
        
        console.log('Final report object being sent to Supabase:', dbReport);
        
        const { data, error } = await supabase.from('reports').insert([dbReport]).select();
        if (error) {
          console.error('Supabase error code:', error.code);
          console.error('Supabase error message:', error.message);
          console.error('Supabase error details:', error.details);
          throw error;
        }
        console.log('Report saved successfully:', data);
        return true;
      } catch (err) {
        console.error('Error saving report for logged-in user:', err);
        return false;
      }
    } else {
      // For guests, save to localStorage
      try {
        const reportStr = JSON.stringify(report);
        console.log('[localStorage] Writing guest_audit_report, size:', reportStr.length, 'bytes');
        localStorage.setItem('guest_audit_report', reportStr);
        console.log('[localStorage] Successfully saved guest report');
        return true;
      } catch (err) {
        console.error('[localStorage] Failed to save guest report:', err);
        if (err.name === 'QuotaExceededError') {
          console.error('[localStorage] Storage quota exceeded, report may be too large');
        }
        return false;
      }
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
  
  // Show dialog after delay for guests or auto-save for logged-in users
  async function gentlyPromptSave() {
    if (!auditResults) return;
    
    if (isLoggedIn) {
      // Auto-save for logged-in users
      const saved = await saveReport(auditResults);
      if (saved) showSavedMessage();
    } else {
      // Show dialog after delay for guests
      dialogTimeout = setTimeout(() => {
        console.log('Timed prompt: Setting showDialog to true');
        showDialog = true;
      }, 6000); // 6 seconds
    }
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
      }
      
      // Show success message
      toast.success('Magic link sent! Check your email.');
    } catch (error) {
      console.error('Error handling magic link submission:', error);
      toast.error('Failed to save report. Please try again.');
    }
  }

  import { page } from '$app/stores';

  onMount(() => {
    // If redirected from guest login, load guest report from localStorage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'guest-login') {
      console.log('[localStorage] Checking for guest_audit_report after login');
      const guestReport = localStorage.getItem('guest_audit_report');
      if (guestReport) {
        console.log('[localStorage] Found guest report, size:', guestReport.length, 'bytes');
        try {
          auditResults = JSON.parse(guestReport);
          console.log('[localStorage] Successfully parsed guest report:', auditResults ? 'valid data' : 'null data');
          console.log('[localStorage] Keeping guest_audit_report in localStorage for persistence');
          // No longer removing the report from localStorage
          // localStorage.removeItem('guest_audit_report');
          // Optionally, show a toast or success message
          showSavedMessage();
        } catch (e) {
          console.error('[localStorage] Failed to parse guest report after login:', e);
        }
      } else {
        console.warn('[localStorage] No guest report found after login redirect');
      }
    } else {
      gentlyPromptSave();
    }
    return () => {
      clearTimeout(dialogTimeout);
      unsubscribe();
      unsubUser();
    };
  });

  // Dummy data following new API response format
  const defaultResults = {
    jobTitle: "Senior Frontend Developer",
    jobBody: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    timestamp: "2025-06-24T12:00:00Z",
    totalScore: 82,
    categories: {
      clarity: { score: 16, maxScore: 20, suggestions: ["Shorten sentences"] },
      promptAlignment: { score: 18, maxScore: 20, suggestions: ["Group skills more logically"] },
      structuredData: { score: 11, maxScore: 15, suggestions: ["Add schema.org/JobPosting JSON-LD"] },
      recency: { score: 8, maxScore: 10, suggestions: [] },
      keywordTargeting: { score: 13, maxScore: 15, suggestions: ["Add more relevant keywords"] },
      compensation: { score: 8, maxScore: 10, suggestions: ["Include salary range"] },
      pageContext: { score: 8, maxScore: 10, suggestions: [] }
    },
    redFlags: ["structuredData"],
    recommendations: [
      "Add schema.org/JobPosting JSON-LD for better visibility",
      "Include a salary range for transparency",
      "Group skills and requirements more logically",
      "Shorten overly long sentences"
    ],
    feedback: "The job posting is clear in terms of specifying required skills, experience, and education. However, the clarity could be improved by shortening sentences and grouping requirements more logically. Adding structured data and a salary range would further increase visibility and transparency."
  };

</script>

<div class="results-page-container">
  <Navbar justLogo={true} />
  
  <!-- Success message toast notification -->
  {#if showSuccessMessage}
    <div class="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-opacity duration-300 z-50 max-w-sm">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <p>Report saved successfully!</p>
      </div>
    </div>
  {/if}
  
  <div class="pt-16"> <!-- Add padding to account for the fixed navbar -->
    {#if auditResults}
      <!-- Use actual results from audit store if available -->
      <ResultsDisplay 
        results={auditResults} 
        visible={true} 
        on:save={() => triggerSaveDialog({type: 'save'})} 
        on:export={() => triggerSaveDialog({type: 'export'})} 
        on:accesslater={() => triggerSaveDialog({type: 'accesslater'})} 
        on:tips={() => triggerSaveDialog({type: 'tips'})} 
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
    background-color: #ffffff;
  }
</style>
