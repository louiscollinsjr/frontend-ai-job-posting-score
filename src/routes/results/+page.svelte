<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth';
  import { auditStore } from '$lib/stores/audit';
  import { resultsPageStore, currentView, hasReport } from '$lib/stores/resultsPage';
  import { ReportsAPI, GuestReportsAPI } from '$lib/api/reports';
  import { GuestManager } from '$lib/services/guestManager';
  
  import LoadingView from '$lib/components/results/views/LoadingView.svelte';
  import EmptyStateView from '$lib/components/results/views/EmptyStateView.svelte';
  import ResultsView from '$lib/components/results/views/ResultsView.svelte';
  import OptimizationView from '$lib/components/results/views/OptimizationView.svelte';
  import SuccessToast from '$lib/components/results/SuccessToast.svelte';
  import Breadcrumbs from '$lib/components/navigation/Breadcrumbs.svelte';
  import type { BreadcrumbItem } from '$lib/components/navigation/Breadcrumbs.svelte';

  
  // Guest toast state
  let showGuestToast = false;
  let currentReportId: string | null = null;

  // Store-derived state
  let currentReport = null;
  let showDialog = false;
  let isOptimizing = false;
  let fromOptimizedSelection = false;

  $: currentReport = $resultsPageStore.currentReport;
  $: showDialog = $resultsPageStore.showSaveDialog;
  $: isOptimizing = $resultsPageStore.isOptimizing;
  $: fromOptimizedSelection = $resultsPageStore.fromOptimizedSelection;

  // Breadcrumb navigation structure
  $: reportIdentifier =
    currentReport?.job_title ??
    currentReport?.title ??
    currentReport?.jobTitle ??
    currentReport?.job_name ??
    'Scorecard';

  $: reportLinkId = currentReport?.id ?? currentReport?.report_id ?? null;

  $: breadcrumbs = (() => {
    const items: BreadcrumbItem[] = [{ label: 'My JobPostScore', href: '/dashboard' }];
    const label = reportIdentifier?.trim() ? reportIdentifier : 'Scorecard';

    if ($currentView === 'optimization') {
      if (reportLinkId) {
        items.push({ label, href: `/results?report=${reportLinkId}` });
      } else {
        items.push({ label });
      }
      items.push({ label: 'Optimized Summary' });
    } else {
      items.push({ label });
    }

    return items;
  })();

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
      } else {
        // If no current report, try to load the most recent from history
        const history = GuestReportsAPI.getHistory();
        if (history.length > 0) {
          const mostRecent = history[0];
          const reportData = GuestReportsAPI.loadReportFromHistory(mostRecent.id);
          if (reportData) {
            resultsPageStore.setCurrentReport(reportData);
          }
        }
      }
    }

    // Handle URL parameters and route changes
    const unsubscribePage = page.subscribe(async ($page) => {
      const reportId = $page.url.searchParams.get('report');
      const viewMode = $page.url.searchParams.get('view'); // 'optimized' or null (default)
      const fromParam = $page.url.searchParams.get('from');
      const guestFlag = $page.url.searchParams.get('guest');
      const legacyId = $page.url.searchParams.get('id');
      
      if (import.meta.env.DEV) {
        console.log('[Results] URL parameters:', { reportId, viewMode, guestFlag, fromParam });
      }

      // Handle legacy guest links like /results?id=...&guest=1
      if (!isLoggedIn && guestFlag === '1') {
        const guestReport = GuestManager.loadGuestReport();
        if (guestReport) {
          resultsPageStore.setCurrentReport(guestReport);
        }
        return; // Do not attempt DB loads for guest links
      }

      const arrivedFromOptimized = fromParam === 'optimized';
      resultsPageStore.setFromOptimizedSelection(arrivedFromOptimized);

      if (reportId) {
        // Set view mode based on URL parameter BEFORE loading report
        if (viewMode === 'optimized') {
          console.log('[Results] Setting requested view to optimized');
          resultsPageStore.setRequestedView('optimized');
          resultsPageStore.setFromOptimizedSelection(false);
        } else {
          console.log('[Results] Setting requested view to original');
          resultsPageStore.setRequestedView('original');
        }

        if (arrivedFromOptimized && viewMode !== 'optimized') {
          console.log('[Results] Arrived from optimized dashboard selection, staying on scorecard');
          resultsPageStore.setRequestedView('original');
        }

        // Check if we need to reload optimization data
        const currentStore = get(resultsPageStore);
        const currentReportId = currentStore.currentReport?.id || currentStore.currentReport?.report_id;
        
        if (reportId === currentReportId && viewMode === 'optimized' && !currentStore.rewriteData) {
          console.log('[DEBUG] Need to reload optimization data for existing report');
          // We have the same report but need optimization data
          await loadReportById(reportId);
        } else {
          // Load report by ID regardless of login status
          queueLoadReportById(reportId);
        }
      } else {
        if (!arrivedFromOptimized) {
          resultsPageStore.setFromOptimizedSelection(false);
        }
        if ($hasReport && !isLoggedIn) {
          GuestManager.schedulePrompt();
        }
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
    resultsPageStore.setLoadingReport(true);
    try {
      const report = await ReportsAPI.loadById(id);
      resultsPageStore.setCurrentReport(report);
      
      // Check if report has optimization data
      if (report && report.optimizationData) {
        console.log('[DEBUG] Found report.optimizationData:', report.optimizationData);
        const opt = report.optimizationData;
        const rewriteData = {
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
        };
        
        console.log('[DEBUG] Created rewriteData:', rewriteData);
        
        // Always store optimization data when available
        // The view component will decide whether to show it based on requestedView
        if (import.meta.env.DEV) {
          console.log('[Results] Setting optimization data for report:', id);
          console.log('[Results] RequestedView:', get(resultsPageStore).requestedView);
        }
        resultsPageStore.setRewriteData(rewriteData);
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
    <div class="px-6 sm:px-10 max-w-7xl mx-auto w-full print:hidden">
      <Breadcrumbs items={breadcrumbs} />
    </div>
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
