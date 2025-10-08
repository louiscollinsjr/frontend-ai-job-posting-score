<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';  
  import { supabase } from '$lib/supabaseClient';
  import { toast } from 'svelte-sonner';
  import * as Button from '$lib/components/ui/button';
  import * as Alert from '$lib/components/ui/alert';
  import * as Table from '$lib/components/ui/table';
  import * as Checkbox from '$lib/components/ui/checkbox';
  import * as Separator from '$lib/components/ui/separator';
  import Dropdown from '$lib/components/ui/dropdown';
  import { env } from '$env/dynamic/public';
  import { optimizeJob } from '$lib/api/audit.js';
  import Breadcrumbs from '$lib/components/navigation/Breadcrumbs.svelte';
  import { dashboardCache } from '$lib/stores/dashboardCache';
  import type { Report } from '$lib/types/report';

  type BreadcrumbItem = {
    label: string;
    href?: string;
  };
  
  type Pagination = {
    currentPage: number;
    totalPages: number;
    totalReports: number;
  };
  
  type ReportOptimization = {
    lowestScore: number;
    highestScore: number;
    hasOptimizations: boolean;
  };
  
  // Data comes from server (page info) and client-side fetching
  export let data: { page: number; limit?: number };
  
  // Client-side data state
  let reports: Report[] = [];
  let pagination: Pagination = { currentPage: data.page, totalPages: 1, totalReports: 0 };
  let reportsWithRewrites: string[] = [];
  let reportOptimizations = new Map<string, ReportOptimization>();
  let reportError: string | null = null;
  let userEmail = '';
  let isAuthenticated = false;
  let authChecked = false;
  let initialLoad = true;
  
  let selectedReports: string[] = [];
  let activeDropdown: string | null = null;
  let loading = false;
  let dropdownPosition = { top: 0, left: 0 };
  let currentUserId: string | null = null;
  let reportsChannel: any = null;
  let realtimeSubscribed = false;
  let authSubscription: any = null;

  const API_BASE_URL = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';
  const dashboardBreadcrumbs: BreadcrumbItem[] = [{ label: 'Dasboard' }];

  // Reactive statement to load data when page URL changes (using cache)
  $: if ($page.url.searchParams.get('page') && authChecked && isAuthenticated && !initialLoad) {
    console.log('[Cache] Page parameter changed, loading from cache');
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const pageNum = Number($page.url.searchParams.get('page') || '1');
        const pageData = await dashboardCache.loadPage(pageNum, session.access_token);
        
        if (pageData) {
          reports = pageData.reports;
          pagination = pageData.pagination;
          
          // Load optimizations if not already loaded
          if (!pageData.optimizations) {
            dashboardCache.loadOptimizations(pageNum, supabase).then(() => {
              const updated = dashboardCache.getCurrentPageData();
              if (updated?.optimizations) {
                reportOptimizations = updated.optimizations;
              }
            });
          } else {
            reportOptimizations = pageData.optimizations;
          }
        }
      }
    })();
  }

  // Also refetch when navigating to dashboard from another route
  $: if ($page.route.id === '/dashboard' && authChecked && isAuthenticated) {
    console.log('[DEBUG] Dashboard route accessed, current reports:', reports.length, 'initialLoad:', initialLoad);
    if (!initialLoad && reports.length === 0) {
      console.log('[Cache] No reports found, reloading from cache');
      (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const pageNum = Number($page.url.searchParams.get('page') || '1');
          const pageData = await dashboardCache.loadPage(pageNum, session.access_token);
          if (pageData) {
            reports = pageData.reports;
            pagination = pageData.pagination;
          }
        }
      })();
    }
  }

  onMount(() => {
    console.log('[DEBUG] Dashboard onMount called');
    document.addEventListener('click', handleClickOutside);
    
    async function initializeDashboard() {
      loading = true;
      await checkAuthAndFetchData();
      
      // Re-fetch when auth state changes
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[DEBUG] Auth state change:', event);
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            try {
              isAuthenticated = !!session;
              userEmail = session?.user?.email || userEmail;
              currentUserId = session?.user?.id || currentUserId;
              if (session?.access_token) {
                loading = true;
                const pageNum = Number($page.url.searchParams.get('page') || '1');
                const pageData = await dashboardCache.loadPage(pageNum, session.access_token, true);
                if (pageData) {
                  reports = pageData.reports;
                  pagination = pageData.pagination;
                }
                setupRealtime();
              }
            } catch (e) {
              console.warn('Auth change handler failed:', e);
            }
          }
        });
        authSubscription = subscription;
      } catch {}
    }
    
    initializeDashboard();
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (reportsChannel) {
        try { supabase.removeChannel(reportsChannel); } catch {}
        reportsChannel = null;
        realtimeSubscribed = false;
      }
      if (authSubscription) {
        try { authSubscription.unsubscribe(); } catch {}
        authSubscription = null;
      }
    };
  });

  async function checkAuthAndFetchData() {
    try {
      console.log('[DEBUG] checkAuthAndFetchData called');
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[DEBUG] Session check:', !!session?.access_token);
      
      if (!session?.access_token) {
        console.log('[DEBUG] No session, redirecting to login');
        loading = false;
        goto('/login');
        return;
      }
      
      isAuthenticated = true;
      userEmail = session.user?.email || 'User';
      currentUserId = session.user?.id;
      console.log('[DEBUG] User authenticated:', userEmail, 'ID:', currentUserId);
      authChecked = true;
      
      if (currentUserId) {
        setupRealtime();
      }
      
      // Load page from cache (or fetch if not cached)
      const pageNum = Number($page.url.searchParams.get('page') || '1');
      console.log('[Cache] Loading page from cache:', pageNum);
      const pageData = await dashboardCache.loadPage(pageNum, session.access_token);
      
      if (pageData) {
        reports = pageData.reports;
        pagination = pageData.pagination;
        
        // Load optimizations in parallel (non-blocking)
        dashboardCache.loadOptimizations(pageNum, supabase).then(() => {
          const updated = dashboardCache.getCurrentPageData();
          if (updated?.optimizations) {
            reportOptimizations = updated.optimizations;
          }
        });
      }
      
      initialLoad = false;
      loading = false;
      console.log('[DEBUG] Initial data load complete');
      
    } catch (error) {
      console.error('Auth check failed:', error);
      goto('/login');
    }
  }

  function setupRealtime() {
    if (realtimeSubscribed || !currentUserId) return;
    
    try {
      reportsChannel = supabase
        .channel(`reports:${currentUserId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'reports',
            filter: `userid=eq.${currentUserId}`
          },
          async (payload) => {
            console.log('[Realtime] New report detected:', payload.new);
            
            // Invalidate current page cache
            const pageNum = Number($page.url.searchParams.get('page') || '1');
            dashboardCache.invalidatePage(pageNum);
            
            // Reload current page
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              const pageData = await dashboardCache.loadPage(pageNum, session.access_token, true);
              if (pageData) {
                reports = pageData.reports;
                pagination = pageData.pagination;
              }
            }
            
            toast.success('New report available!');
          }
        )
        .subscribe();
      
      realtimeSubscribed = true;
      console.log('[Realtime] Subscribed to reports channel');
    } catch (error) {
      console.error('[Realtime] Subscription failed:', error);
    }
  }

  // Helper function to calculate overall score from report data
  function calculateOverallScore(report: any): number {
    if (report.overallScore) return report.overallScore;
    
    if (report.categories && Array.isArray(report.categories)) {
      const scores = report.categories.map((cat: any) => cat.score || 0);
      if (scores.length > 0) {
        return Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length);
      }
    }
    
    return 0;
  }
  
  // Normalization helpers
  function getTitle(r: any): string {
    return r.title || r.job_title || r.jobTitle || r.jobtitle || 'Untitled';
  }
  function getCompany(r: any): string {
    return r.company || r.company_name || r.companyName || 'N/A';
  }
  function getDate(r: any): string {
    const d = r.date || r.created_at || r.createdAt || r.savedat;
    try {
      return d ? new Date(d).toLocaleDateString() : 'N/A';
    } catch {
      return 'N/A';
    }
  }
  function getScore(r: any): number {
    const dbScore = r.totalscore ?? r.total_score;
    if (typeof dbScore === 'number') return dbScore;
    const apiScore = r.overallScore ?? r.score;
    if (typeof apiScore === 'number') return apiScore;
    const origScore = r.originalreport?.total_score ?? r.originalreport?.overallScore ?? r.original_report?.total_score ?? r.original_report?.overallScore;
    if (typeof origScore === 'number') return origScore;
    return calculateOverallScore(r) ?? 0;
  }

  function dateValue(item: any): number {
    const dateStr = item?.savedat || item?.created_at || item?.createdAt;
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  function openScorecard(reportId: string, { fromOptimized = false } = {}): void {
    if (!reportId) return;
    const params = new URLSearchParams({ report: reportId });
    if (fromOptimized) {
      params.set('from', 'optimized');
    }
    goto(`/results?${params.toString()}`);
  }

  // Report action functions
  function viewReport(reportId: string): void {
    openScorecard(reportId);
  }

  async function optimizeReport(reportId: string): Promise<void> {
    loading = true;
    try {
      await optimizeJob(reportId);
      toast.success('Optimization started! Redirecting to results...');
      goto(`/results?report=${reportId}`);
    } catch (error: unknown) {
      console.error('Error optimizing report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Optimization failed: ${errorMessage}`);
    } finally {
      loading = false;
    }
  }

  async function deleteReport(reportId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    loading = true;
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report deleted successfully');
      
      // Invalidate cache and reload
      const pageNum = Number($page.url.searchParams.get('page') || '1');
      dashboardCache.invalidatePage(pageNum);
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    } finally {
      loading = false;
    }
  }

  function viewRewriteHistory(reportId: string): void {
    goto(`/rewrite-history?report=${reportId}`);
  }

  function viewJsonLd(reportId: string): void {
    goto(`/json-ld?report=${reportId}`);
  }

  function toggleSelectReport(reportId: string): void {
    if (selectedReports.includes(reportId)) {
      selectedReports = selectedReports.filter(id => id !== reportId);
    } else {
      selectedReports = [...selectedReports, reportId];
    }
  }

  function toggleSelectAll(): void {
    if (selectedReports.length === reports.length) {
      selectedReports = [];
    } else {
      selectedReports = reports.map(report => report.id).filter((id): id is string => id !== undefined);
    }
  }

  async function archiveSelected() {
    if (selectedReports.length === 0) return;

    loading = true;
    try {
      const { error } = await supabase
        .from('reports')
        .update({ archived: true })
        .in('id', selectedReports);

      if (error) throw error;

      toast.success(`${selectedReports.length} reports archived`);
      selectedReports = [];
      
      // Invalidate cache and reload
      const pageNum = Number($page.url.searchParams.get('page') || '1');
      dashboardCache.invalidatePage(pageNum);
      window.location.reload();
    } catch (error) {
      console.error('Error archiving reports:', error);
      toast.error('Failed to archive reports');
    } finally {
      loading = false;
    }
  }

  function handleClickOutside(event: MouseEvent): void {
    if (activeDropdown && event.target && !(event.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      activeDropdown = null;
    }
  }

  function toggleDropdown(reportId: string, event: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (activeDropdown === reportId) {
      activeDropdown = null;
    } else {
      activeDropdown = reportId;
    }
  }

  function positionDropdown(node: HTMLElement, reportId: string): void {
    if (activeDropdown === reportId) {
      const trigger = document.querySelector(`[data-dropdown-trigger="${reportId}"]`);
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        node.style.top = `${rect.bottom + window.scrollY + 5}px`;
        node.style.left = `${rect.right + window.scrollX - node.offsetWidth}px`;
      }
    }
  }

  function handleReportChange(payload: any): void {
    try {
      const evt = payload.eventType;
      const newRow = payload.new || {};
      const oldRow = payload.old || {};
      if (evt === 'INSERT') {
        if (newRow.userid !== currentUserId) return;
        reports = [newRow, ...reports].sort((a, b) => dateValue(b) - dateValue(a));
        pagination = { ...pagination, totalReports: (pagination.totalReports || 0) + 1 };
      } else if (evt === 'UPDATE') {
        reports = reports.map((r) => (r.id === newRow.id ? { ...r, ...newRow } : r));
      } else if (evt === 'DELETE') {
        const before = reports.length;
        reports = reports.filter((r) => r.id !== (oldRow.id || oldRow.reportid));
        if (reports.length < before) {
          pagination = { ...pagination, totalReports: Math.max(0, (pagination.totalReports || 0) - 1) };
        }
      }
    } catch (e) {
      console.warn('Failed to apply realtime change:', e);
    }
  }
</script>
<svelte:window on:click={handleClickOutside} />

<div class="flex min-h-screen w-full relative z-10">
  <!-- Main Content -->
  <div class="flex-1 p-8 w-full pt-32 max-w-7xl relative z-10">
    <Breadcrumbs items={dashboardBreadcrumbs} />
    <!-- Dashboard Header -->
    <div class="flex justify-between items-center mb-10 w-full">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">JobPostScore Dashboard</h1>
        <p class="text-sm text-gray-500">Welcome back 👋, {userEmail}</p>
      </div>
      <a href="/" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors border border-transparent">
        New JobPostScore
      </a>
    </div>
    
    <Separator.Root class="my-12" />
    
    {#if reportError}
      <Alert.Root class="mb-6">
        <Alert.Description>
          {reportError}
        </Alert.Description>
      </Alert.Root>
    {:else}
      <!-- Reports Table -->
      <div class="bg-transparent rounded-lg shadow-none w-full pb-32">
        <div class="p-6 pl-2 border-0 border-gray-100 flex flex-col sm:flex-row justify-between gap-4 w-full">
          <div class="">
            <h2 class="text-base font-medium text-gray-700">Your Reports</h2>
            {#if reports.length > 0}
              <p class="text-sm text-gray-500 mt-1">
                Showing {Math.min(((pagination.currentPage - 1) * (Number(data.limit) || 20)) + 1, pagination.totalReports)}-{Math.min(pagination.currentPage * (Number(data.limit) || 20), pagination.totalReports)} of {pagination.totalReports} report{pagination.totalReports === 1 ? '' : 's'}
              </p>
            {/if}
          </div>
          
          {#if selectedReports.length > 0}
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{selectedReports.length} selected</span>
              <Button.Root on:click={archiveSelected} variant="outline" size="sm" class="text-xs">
                Archive Selected
              </Button.Root>
            </div>
          {/if}
        </div>
        
        <div class="w-full">
          {#if loading}
            <div class="border-2 border-black rounded-lg w-full overflow-visible">
              <div class="animate-pulse divide-y divide-gray-100">
                <div class="p-4 flex items-center gap-4">
                  <div class="ml-2 h-4 w-4 bg-gray-200 rounded"></div>
                  <div class="h-4 w-1/3 bg-gray-200 rounded"></div>
                  <div class="ml-auto h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                {#each Array.from({ length: 6 }) as _, idx}
                  <div class="p-4 grid grid-cols-[5%_auto_7rem_5rem_2rem] items-center gap-2" role="presentation">
                    <div class="h-4 w-4 bg-gray-200 rounded ml-2"></div>
                    <div class="h-3 w-2/3 bg-gray-200 rounded"></div>
                    <div class="h-3 w-20 bg-gray-200 rounded justify-self-start"></div>
                    <div class="h-6 w-12 bg-gray-200 rounded-full justify-self-center"></div>
                    <div class="h-6 w-6 bg-gray-200 rounded justify-self-end"></div>
                  </div>
                {/each}
              </div>
            </div>
          {:else if reports.length === 0 && !loading && authChecked}
            <div class="p-12 text-center min-h-[300px] flex flex-col justify-center items-center">
              <p class="text-gray-500 mb-4">No reports found. Start by getting your first JobPostScore.</p>
              <Button.Root on:click={() => { window.location.href = '/'; }} variant="default" size="sm" class="bg-black hover:bg-gray-800 text-white">
                Get JobPostScore
              </Button.Root>
            </div>
          {:else}
            <div class="border-2 border-black rounded-lg w-full overflow-visible">
              <Table.Root class="w-full">
                <Table.Header class="text-xs">
                  <Table.Row class="">
                    <Table.Head class="w-[5%]">
                      <Checkbox.Root class="ml-2"
                        checked={selectedReports.length === reports.length && reports.length > 0}
                        on:click={toggleSelectAll}
                      />
                    </Table.Head>
                    <Table.Head class="w-auto">Job Title</Table.Head>
                    <Table.Head class="w-28 whitespace-nowrap">Date</Table.Head>
                    <Table.Head class="w-32 text-center">Score</Table.Head>
                    <Table.Head class="w-10 text-right">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body class="text-xs">
                  {#each reports as report}
                    <Table.Row
                      class="group cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-50"
                      on:click={() => report.id && openScorecard(report.id)}
                    >
                      {@const reportId = report.id ?? report.report_id ?? null}
                      <Table.Cell class="w-8">
                        <Checkbox.Root 
                          checked={reportId ? selectedReports.includes(reportId) : false}
                          on:click={(e) => { e.stopPropagation(); if (reportId) toggleSelectReport(reportId); }}
                        />
                      </Table.Cell>
                      <Table.Cell class="font-normal text-[10px] w-auto">
                        {#if reportId}
                          <a href={`/results?report=${reportId}`} class="block py-3 -my-3 hover:underline cursor-pointer">
                            {getTitle(report)}
                          </a>
                        {:else}
                          <span class="block py-3 -my-3 text-gray-500">{getTitle(report)}</span>
                        {/if}
                      </Table.Cell>
                      <Table.Cell class="text-[10px] w-28 whitespace-nowrap">
                        {#if reportId}
                          <a href={`/results?report=${reportId}`} class="block py-3 -my-3 hover:underline cursor-pointer">
                            {getDate(report)}
                          </a>
                        {:else}
                          <span class="block py-3 -my-3 text-gray-500">{getDate(report)}</span>
                        {/if}
                      </Table.Cell>
                      <Table.Cell class="text-center w-32 py-4">
                        {#if reportId && reportOptimizations.has(reportId)}
                          <!-- Show score range for reports with optimizations -->
                          {@const optimization = reportOptimizations.get(reportId)}
                          {@const improvement = optimization ? optimization.highestScore - optimization.lowestScore : 0}
                          <div class="flex flex-row gap-1 items-center justify-center">
                            <!-- Original score (lowest) - always show in red/yellow to indicate "before" -->
                            <a 
                              href={`/results?report=${reportId}`} 
                              class="inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] cursor-pointer hover:opacity-80 transition-opacity
                                {optimization && optimization.lowestScore >= 60 ? 'bg-yellow-400 text-black' : 
                                optimization && optimization.lowestScore >= 40 ? 'bg-red-400 text-white' :
                                'bg-red-600 text-white'}"
                              on:click={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                openScorecard(reportId);
                              }}
                              title="Original score: {optimization?.lowestScore ?? 0}"
                            >
                              {optimization?.lowestScore ?? 0}
                            </a>
                            <!-- Arrow indicator for improvement -->
                            {#if improvement > 0}
                              <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                              </svg>
                            {/if}
                            <!-- Optimized score (highest) - show in green/yellow to indicate "after" improvement -->
                            <a 
                              href={`/results?report=${reportId}&from=optimized`} 
                              class="inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] cursor-pointer hover:opacity-80 transition-opacity
                                {optimization && optimization.highestScore >= 85 ? 'bg-green-600 text-white' : 
                                optimization && optimization.highestScore >= 70 ? 'bg-green-500 text-white' : 
                                optimization && optimization.highestScore >= 60 ? 'bg-yellow-300 text-black' : 
                                optimization && optimization.highestScore >= 50 ? 'bg-yellow-400 text-black' :
                                'bg-orange-400 text-white'}"
                              on:click={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                openScorecard(reportId, { fromOptimized: true });
                              }}
                              title="Optimized score: {optimization?.highestScore ?? 0} (+{improvement})"
                            >
                              {optimization?.highestScore ?? 0}
                            </a>
                          </div>
                        {:else}
                          <!-- Show single score for reports without optimizations -->
                          {#if reportId}
                          <a 
                            href={`/results?report=${reportId}`} 
                            class="inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] cursor-pointer hover:opacity-80 transition-opacity
                              {getScore(report) >= 85 ? 'bg-green-500 text-white' : 
                              getScore(report) >= 60 ? 'bg-yellow-300 text-black' : 
                              getScore(report) >= 40 ? 'bg-red-400 text-white' :
                              'bg-red-600 text-white'}"
                            on:click={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              openScorecard(reportId);
                            }}
                          >
                            {getScore(report)}
                          </a>
                          {:else}
                            <span class="inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] bg-gray-200 text-gray-600">
                              {getScore(report)}
                            </span>
                          {/if}
                        {/if}
                      </Table.Cell>
                      <Table.Cell class="text-right w-10">
                        <div 
                          class="relative" 
                          role="button" 
                          tabindex="0"
                          aria-label="Row actions menu"
                          data-row-action 
                          on:click|stopPropagation 
                          on:mousedown|stopPropagation 
                          on:keydown|stopPropagation
                        >
                          <button
                            class="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            data-dropdown-trigger={report.id}
                            id="dropdown-button-{reportId}"
                            on:click={(e) => reportId && toggleDropdown(reportId, e)}
                            on:mousedown|stopPropagation
                            on:keydown|stopPropagation
                          >
                            <span class="sr-only">Open menu</span>
                            <svg 
                              width="15" 
                              height="15" 
                              viewBox="0 0 15 15" 
                              fill="none" 
                              xmlns="http://www.w3.org/2000/svg" 
                              class="h-4 w-4"
                            >
                              <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>
                            </svg>
                          </button>
                          
                          {#if reportId && activeDropdown === reportId}
                            <div 
                              class="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[9999]"
                              use:positionDropdown={reportId}
                              role="menu"
                              aria-labelledby="dropdown-button-{reportId}"
                              tabindex="-1"
                              on:click|stopPropagation
                              on:keydown={(e) => { if (e.key === 'Escape') activeDropdown = null; }}
                            >
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm flex items-center"
                                on:click={() => { openScorecard(reportId); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                View Post
                              </button>
                              {#if reportOptimizations.has(reportId)}
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm flex items-center"
                                on:click={() => { openScorecard(reportId, { fromOptimized: true }); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                View Optimized Post
                              </button>
                              {/if}
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm flex items-center"
                                on:click={() => { viewJsonLd(reportId); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                View JSON-LD
                              </button>
                              <div class="my-1 h-px bg-gray-100"></div>
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-sm flex items-center"
                                on:click={() => { deleteReport(reportId); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                Delete
                              </button>
                            </div>
                          {/if}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  {/each}
                </Table.Body>
              </Table.Root>
            </div>
          {/if}
        </div>  
      </div>
    {/if}

    <!-- Pagination Controls -->
    {#if pagination && pagination.totalPages > 1}
      <div class="flex justify-center items-center gap-4 mt-8">
        <Button.Root 
          href={`/dashboard?page=${pagination.currentPage - 1}`} 
          disabled={pagination.currentPage <= 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button.Root>
        
        <span class="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        
        <Button.Root 
          href={`/dashboard?page=${pagination.currentPage + 1}`} 
          disabled={pagination.currentPage >= pagination.totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button.Root>
      </div>
    {/if}
  </div>
</div>
