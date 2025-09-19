<script lang="ts">
  import { onMount } from 'svelte';
  import { GuestReportsAPI } from '$lib/api/reports';
  import type { GuestReportSummary } from '$lib/api/reports';
  import Logo from './Logo.svelte';

  let history: GuestReportSummary[] = [];
  let loading = true;

  onMount(() => {
    loadHistory();
  });

  function loadHistory() {
    loading = true;
    console.log('[GuestDashboard] Loading history...');
    history = GuestReportsAPI.getHistory();
    console.log('[GuestDashboard] Loaded history:', history);
    
    // Also check current report
    const currentReport = GuestReportsAPI.load();
    console.log('[GuestDashboard] Current report:', currentReport);
    
    loading = false;
  }

  function viewReport(reportId: string) {
    console.log('[GuestDashboard] Viewing report:', reportId);
    // Load the specific report from history and set as current
    const reportData = GuestReportsAPI.loadReportFromHistory(reportId);
    if (reportData) {
      console.log('[GuestDashboard] Successfully loaded report, navigating to results');
      // Navigate to results page; the loaded report will be available
      window.location.href = `/results`;
    } else {
      console.error('[GuestDashboard] Failed to load report:', reportId);
      alert('Unable to load the selected report. It may have been corrupted or expired.');
    }
  }

  function clearHistory() {
    if (confirm('Clear all cached reports? This cannot be undone.')) {
      GuestReportsAPI.clearAll();
      history = [];
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <!-- Header -->
  <div class="text-center mb-8">
    <div class="flex items-center justify-center gap-2 mb-4">
      <Logo variant="black" alt="JobPostScore" imgClass="h-8 w-auto" />
      <h1 class="text-2xl font-bold text-gray-900">Your Reports</h1>
    </div>
    <p class="text-gray-600">Recent JobPostScore analyses cached in your browser</p>
  </div>

  {#if loading}
    <!-- Loading State -->
    <div class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else if history.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by analyzing your first job posting</p>
      <div class="mt-6">
        <a
          href="/"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Analyze Job Posting
        </a>
      </div>
    </div>
  {:else}
    <!-- Reports List -->
    <div class="space-y-4 mb-8">
      {#each history as report}
        <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div class="p-6">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {report.job_title || 'Untitled Position'}
                  </h3>
                  {#if report.overallScore !== undefined}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getScoreColor(report.overallScore)}">
                      {Math.round(report.overallScore)}/100
                    </span>
                  {/if}
                </div>
                
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span>{GuestReportsAPI.getTimeAgo(report.timestamp)}</span>
                  {#if report.company_name}
                    <span>•</span>
                    <span>{report.company_name}</span>
                  {/if}
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <button
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  on:click={() => viewReport(report.id)}
                >
                  View Report
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center border-t border-gray-200 pt-6">
      <div class="text-sm text-gray-500">
        {history.length} report{history.length === 1 ? '' : 's'} • 
        Reports are cached locally for 7 days
      </div>
      
      <div class="flex gap-3">
        <button
          class="text-sm text-gray-600 hover:text-gray-800"
          on:click={clearHistory}
        >
          Clear All
        </button>
        <a
          href="/"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          New Analysis
        </a>
      </div>
    </div>
  {/if}
</div>
