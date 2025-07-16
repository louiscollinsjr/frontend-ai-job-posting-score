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

  let auditResults: Report | null = null;
  let showDialog = false;
  let dialogTimeout;
  let isLoggedIn = false;
  let showSuccessMessage = false;
  let successMessageTimeout;
  let rewriteData = null;
  let results = null;

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
    // Ensure all required fields are present and match DB schema
    return {
      userid: userId,
      job_title: report.job_title || 'Untitled Job',
      job_body: report.job_body || report.content || '',
      feedback: report.feedback || '',
      total_score: report.total_score || 0,
      categories: report.categories || {},
      recommendations: report.recommendations || [],
      red_flags: report.red_flags || [],
      savedat: new Date().toISOString(),
      source: report.source || 'web_app',
      original_text: report.job_body || report.content || '',
      original_report: report.job_body || report.content || ''
    };
  }

  // Save report to localStorage for guests or to database for logged-in users
  async function saveReport(report: any) {
    if (!report) return;
    
    if (isLoggedIn && userVal?.id) {
      try {
        const formattedReport = formatReportForDB(report, userVal.id);
        
        // Save to database
        const { data, error } = await supabase
          .from('reports')
          .insert([formattedReport])
          .select('id, json_ld, job_title, job_body, feedback, total_score')
          .single();
          
        if (error) throw error;
        
        console.log('Report saved successfully with ID:', data.id);
        
        // Update the audit store safely
        try {
          auditStore.update(state => {
            if (!state || !state.results) {
              return { 
                results: {
                  id: data.id,
                  json_ld: data.json_ld,
                  job_title: data.job_title,
                  job_body: data.job_body,
                  feedback: data.feedback,
                  total_score: data.total_score
                }
              };
            }
            
            return {
              ...state,
              results: {
                ...state.results,
                id: data.id,
                json_ld: data.json_ld,
                job_title: data.job_title,
                job_body: data.job_body,
                feedback: data.feedback,
                total_score: data.total_score
              }
            };
          });
          
          // Also update the local results variable
          auditResults = {
            ...auditResults,
            id: data.id,
            json_ld: data.json_ld
          };
        } catch (storeErr) {
          console.error('Error updating store:', storeErr);
        }
        
        // Store the ID in localStorage as fallback
        if (data.id) {
          localStorage.setItem('last_job_id', data.id);
          console.log('Saved job ID to localStorage:', data.id);
        }
        
        return true;
      } catch (err) {
        console.error('Error saving report:', err);
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

  function handleRewrite(event) {
    rewriteData = event.detail;
  }
  
  function handleBackToResults() {
    rewriteData = null;
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
    {#if rewriteData}
      <div class="back-button" on:click={handleBackToResults}>
        ← Back to Results
      </div>
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
    background-color: #ffffff;
  }
</style>
