<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth';
  import { auditStore } from '$lib/stores/audit';
  import { resultsPageStore, currentView, hasReport } from '$lib/stores/resultsPage';
  import { ReportsAPI, GuestReportsAPI } from '$lib/api/reports';
  import { GuestManager } from '$lib/services/guestManager';
  
  // View components
  import LoadingView from '$lib/components/results/views/LoadingView.svelte';
  import EmptyStateView from '$lib/components/results/views/EmptyStateView.svelte';
  import ResultsView from '$lib/components/results/views/ResultsView.svelte';
  import OptimizationView from '$lib/components/results/views/OptimizationView.svelte';
  import SuccessToast from '$lib/components/results/SuccessToast.svelte';

  let isLoggedIn = false;
  let lastReportId: string | null = null;
  // Queued loader to avoid overlapping async work from reactive changes
  function queueLoadReportById(id: string) {
    if (!id) return;
    const currentReport = $resultsPageStore.currentReport;
    const currentId = currentReport?.id ?? currentReport?.report_id;
    if (id === lastReportId || id === currentId) {
      lastReportId = id;
      return;
    }
    if ($resultsPageStore.isLoadingReport) {
      resultsPageStore.setPendingReportId(id);
      return;
    }
    loadReportById(id);
  }

  onMount(() => {
    // Handle guest login cleanup
    if (GuestManager.isFromGuestLogin()) {
      GuestManager.handleGuestLogin();
      resultsPageStore.setFromGuestLogin(true);
    }

    // Subscribe to stores
    const unsubscribeUser = user.subscribe((val) => {
      isLoggedIn = !!(val?.id);
    });

    const unsubscribeAudit = auditStore.subscribe((state: any) => {
      if (state.results) {
        resultsPageStore.setCurrentReport(state.results);
      }
    });

    // Load guest report if not logged in and no current report
    if (!$hasReport && !isLoggedIn) {
      const guestReport = GuestManager.loadGuestReport();
      if (guestReport) {
        resultsPageStore.setCurrentReport(guestReport);
      }
    }

    // Handle URL parameters and route changes
    const unsubscribePage = page.subscribe(async ($page) => {
      const reportId = $page.url.searchParams.get('report');
      const guestFlag = $page.url.searchParams.get('guest');
      const legacyId = $page.url.searchParams.get('id');

      // Handle legacy guest links like /results?id=...&guest=1
      if (!isLoggedIn && guestFlag === '1') {
        const guestReport = GuestManager.loadGuestReport();
        if (guestReport) {
          resultsPageStore.setCurrentReport(guestReport);
        }
        return; // Do not attempt DB loads for guest links
      }

      if (reportId && isLoggedIn) {
        queueLoadReportById(reportId);
      } else if ($hasReport && !isLoggedIn) {
        GuestManager.schedulePrompt();
      }
    });

    // Handle pending report loads
    const unsubscribeStore = resultsPageStore.subscribe(($store) => {
      if (!$store.isLoadingReport && $store.pendingReportId && $store.pendingReportId !== lastReportId) {
        const nextId = $store.pendingReportId;
        resultsPageStore.setPendingReportId(null);
        loadReportById(nextId);
      }
    });

    // Cleanup
    return () => {
      unsubscribeUser();
      unsubscribeAudit();
      unsubscribePage();
      unsubscribeStore();
      resultsPageStore.clearTimeouts();
      GuestManager.cleanup();
    };
  });

  // Add this reactive statement to handle auth state changes and URL parameters
  $: if (browser && isLoggedIn) {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('report');
    if (reportId && !$hasReport) {
      queueLoadReportById(reportId);
    }
  }



  async function loadReportById(id: string) {
    lastReportId = id;
    resultsPageStore.setLoadingReport(true);
    try {
      const report = await ReportsAPI.loadById(id);
      resultsPageStore.setCurrentReport(report);
      
      // Set optimization data if available
      if (report?.optimizationData) {
        const opt = report.optimizationData;
        resultsPageStore.setRewriteData({
          original_text: opt.original_text_snapshot || '',
          improvedText: opt.optimized_text || '',
          score: opt.optimized_score || 0,
          id: id,
          optimizationData: {
            originalText: opt.original_text_snapshot || report?.job_body,
            optimizedText: opt.optimized_text,
            originalScore: opt.original_score || 0,
            optimizedScore: opt.optimized_score,
            scoreImprovement: opt.optimized_score - (opt.original_score || 0),
            appliedImprovements: Array.isArray(opt.change_log) 
              ? opt.change_log 
              : JSON.parse(opt.change_log || '[]'),
            potentialImprovements: Array.isArray(opt.unaddressed_items)
              ? opt.unaddressed_items
              : JSON.parse(opt.unaddressed_items || '[]'),
            workingWell: []
          }
        });
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      resultsPageStore.setLoadingReport(false);
    }
  }

</script>

<div class="results-page-container relative z-10 print:bg-white">
  <SuccessToast />
  
  <div class="pt-16 relative z-10 print:pt-0"> <!-- Add padding to account for the fixed navbar -->
    {#if $currentView === 'loading'}
      <LoadingView />
    {:else if $currentView === 'optimization'}
      <OptimizationView />
    {:else if $currentView === 'results'}
      <ResultsView {isLoggedIn} />
    {:else}
      <EmptyStateView />
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
