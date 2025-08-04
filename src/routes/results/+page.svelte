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
          console.log('Updating store with saved data:', { 
            id: data.id, 
            hasJsonLd: !!data.json_ld 
          });
          
          // Verify we have JSON-LD data before updating store
          if (!data.json_ld) {
            console.warn('No JSON-LD in saved report, attempting to retrieve it specifically');
            try {
              // Try to retrieve JSON-LD specifically
              const { data: jsonLdData, error: jsonLdError } = await supabase
                .from('reports')
                .select('json_ld')
                .eq('id', data.id)
                .single();
                
              if (jsonLdData?.json_ld) {
                console.log('Retrieved JSON-LD separately:', !!jsonLdData.json_ld);
                data.json_ld = jsonLdData.json_ld;
              } else if (jsonLdError) {
                console.warn('Error retrieving JSON-LD:', jsonLdError);
              }
            } catch (jsonLdErr) {
              console.error('Error in JSON-LD retrieval:', jsonLdErr);
            }
          }
          
          // Update the store with all available data
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
          
          // Also update any local variables used by components
          if (typeof results !== 'undefined') {
            results = {
              ...results,
              id: data.id,
              json_ld: data.json_ld
            };
          }
          
          // Update the auditResults variable if it exists
          if (typeof auditResults !== 'undefined') {
            auditResults = {
              ...auditResults,
              id: data.id,
              json_ld: data.json_ld
            };
          }
          
          console.log('Store updated successfully with data including JSON-LD:', !!data.json_ld);
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

  onMount(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const reportId = urlParams.get('report');
    
    // Priority 1: Load specific report if report ID is provided
    if (reportId && isLoggedIn) {
      loadReportById(reportId);
    }
    // Priority 2: Handle guest login redirect
    else if (fromParam === 'guest-login') {
      console.log('[localStorage] Checking for guest_audit_report after login');
      const guestReport = localStorage.getItem('guest_audit_report');
      if (guestReport) {
        console.log('[localStorage] Found guest report, size:', guestReport.length, 'bytes');
        try {
          auditResults = JSON.parse(guestReport);
          // Save report to database now that user is logged in
          const userId = userVal?.id;
          async function saveGuestReport() {
            const { data: reportData, error: reportError } = await supabase
              .from('reports')
              .insert([{
                userid: userId,
                jobtitle: guestReport.job_title,
                job_body: guestReport.job_body,
                feedback: guestReport.feedback,
                totalscore: guestReport.total_score,
                categories: guestReport.categories,
                recommendations: guestReport.recommendations,
                redflags: guestReport.red_flags,
                savedat: new Date().toISOString(),
                source: guestReport.source,
                originalreport: guestReport.original_report
              }])
              .select('*');
            if (reportError) {
              console.error('Error saving guest report:', reportError);
            } else {
              console.log('Guest report saved successfully:', reportData);
              // Optionally, show a toast or success message
              showSavedMessage();
            }
          }
          saveGuestReport();
        } catch (e) {
          console.error('[localStorage] Failed to parse guest report after login:', e);
        }
      } else {
        console.warn('[localStorage] No guest report found after login redirect');
      }
    }
    // Priority 3: For normal visits, just prompt guests to save (no auto-save)
    else {
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
    background-color: #ffffff;
  }
</style>
