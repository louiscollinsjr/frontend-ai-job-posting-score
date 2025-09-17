<script lang="ts">
  import { resultsPageStore } from '$lib/stores/resultsPage';
  import { ReportsAPI, GuestReportsAPI } from '$lib/api/reports';
  import { optimizeJob } from '$lib/api/audit';
  import { get } from 'svelte/store';
  import { user } from '$lib/stores/auth';
  import { auditStore } from '$lib/stores/audit';
  import { toast } from 'svelte-sonner';
  import { GuestManager } from '$lib/services/guestManager';
  import { onMount } from 'svelte';
  
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import GuestSavePrompt from '$lib/components/results/GuestSavePrompt.svelte';
  import GuestReportToast from '$lib/components/GuestReportToast.svelte';

  export let isLoggedIn: boolean;

  $: currentReport = $resultsPageStore.currentReport;
  $: showDialog = $resultsPageStore.showSaveDialog;
  $: isOptimizing = $resultsPageStore.isOptimizing;

  // Guest toast state
  let showGuestToast = false;
  let currentReportId: string | null = null;

  // Debug logging for current state
  $: {
    console.log('[ResultsView] Current state:', {
      isLoggedIn,
      currentReport: currentReport ? 'EXISTS' : 'NULL',
      reportId: currentReport?.id || currentReport?.report_id || 'NO_ID',
      currentReportId
    });
  }

  // Auto-cache guest reports - simplified approach
  $: if (!isLoggedIn && currentReport) {
    const reportId = currentReport?.id || currentReport?.report_id || Date.now().toString();
    
    console.log('[ResultsView] Checking if should cache report:', { reportId, currentReportId, isLoggedIn });
    
    // Only cache if this is a new report we haven't seen before
    if (reportId !== currentReportId) {
      console.log('[ResultsView] Caching guest report:', reportId, currentReport);
      const saved = GuestManager.saveReportWithFeedback(currentReport);
      if (saved) {
        console.log('[ResultsView] Report cached successfully');
        showGuestToast = true;
        currentReportId = reportId;
      } else {
        console.error('[ResultsView] Failed to cache report');
      }
    } else {
      console.log('[ResultsView] Report already cached, skipping');
    }
  }

  async function handleSave() {
    if (!currentReport) return;
    
    try {
      if (isLoggedIn) {
        const currentUser = get(user);
        const savedReport = await ReportsAPI.save(currentReport, currentUser?.id || null);
        
        // Update the audit store with the saved report data
        auditStore.update((state: any) => ({
          ...state,
          results: {
            ...(state?.results || {}),
            ...savedReport
          }
        }));

        // Update local state
        resultsPageStore.setCurrentReport({ ...(currentReport || {}), ...savedReport });
        resultsPageStore.showSuccessToast();
      } else {
        resultsPageStore.showSaveDialog();
      }
    } catch (error) {
      if (!isLoggedIn) {
        // Fallback to localStorage for guests
        const saved = GuestManager.saveReportWithFeedback(currentReport);
        if (saved) {
          showGuestToast = true;
          currentReportId = currentReport?.id || currentReport?.report_id || null;
          resultsPageStore.showSuccessToast();
        } else {
          toast.error('Failed to save report');
        }
      } else {
        console.error('Save failed:', error);
        toast.error('Failed to save report');
      }
    }
  }

  async function handleOptimize() {
    if (!currentReport?.id && !currentReport?.report_id) {
      toast.error('No report available to optimize');
      return;
    }

    const reportId = currentReport.id || currentReport.report_id;
    if (!reportId) {
      toast.error('Report ID is missing, cannot optimize');
      return;
    }

    resultsPageStore.setOptimizing(true);
    try {
      const result = await optimizeJob(reportId);
      
      resultsPageStore.setRewriteData({
        original_text: currentReport.job_body || '',
        improvedText: result.rewritten_text,
        score: result.new_score,
        id: reportId,
        optimizationData: {
          change_log: result.change_log,
          unaddressed_items: result.unaddressed_items
        }
      });

      // Update current report with new score
      resultsPageStore.setCurrentReport({
        ...currentReport,
        total_score: result.new_score,
        improved_text: result.rewritten_text
      });

      toast.success('Job posting optimized successfully!');
    } catch (error: unknown) {
      console.error('Optimization failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Optimization failed: ${message}`);
    } finally {
      resultsPageStore.setOptimizing(false);
    }
  }

  function downloadReport() {
    if (!currentReport) {
      toast.error('No report data available');
      return;
    }
    
    // Trigger browser print dialog
    window.print();
  }

  function downloadJobData() {
    if (!currentReport) {
      toast.error('No report data available');
      return;
    }
    
    try {
      // Extract JSON-LD data from the report
      const jsonLdData = currentReport.json_ld || {};
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(jsonLdData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-posting-data-${currentReport.id || Date.now()}.json`;
      
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

  function handleMagicLink(event: any) {
    const { email, report } = event.detail;
    try {
      // Save the report to localStorage so it can be associated with the user after login
      if (report) GuestReportsAPI.save(report);
      
      // Show success message
      toast.success('Magic link sent! Check your email.');
    } catch (error) {
      console.error('Error handling magic link submission:', error);
      toast.error('Failed to save report. Please try again.');
    }
  }
</script>

{#if currentReport}
  <ResultsDisplay 
    results={currentReport}
    {isLoggedIn}
    rewriteLoading={isOptimizing}
    loading={false}
    on:save={handleSave}
    on:optimize={handleOptimize}
    {downloadReport}
    {downloadJobData}
  />
  
  <GuestSavePrompt
    bind:open={showDialog}
    report={currentReport}
    on:submit={handleMagicLink}
    on:close={() => resultsPageStore.hideSaveDialog()}
  />
  
  <!-- Guest Report Toast - Only show for guest users -->
  {#if !isLoggedIn}
    <GuestReportToast 
      bind:show={showGuestToast}
      {currentReportId}
    />
  {/if}
{/if}
