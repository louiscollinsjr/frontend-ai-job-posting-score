<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { GuestReportsAPI } from '$lib/api/reports';
  import type { GuestReportSummary } from '$lib/api/reports';

  let show = true;
  let showHistory = false;
  let history: GuestReportSummary[] = [];

  onMount(() => {
    loadHistory();
    
    // Auto-dismiss after 8 seconds
    let timer: ReturnType<typeof setTimeout>;
    
    if (browser && show && !showHistory) {
      timer = setTimeout(() => {
        show = false;
      }, 8000);
    }
    
    // Cleanup function
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  function loadHistory() {
    if (browser) {
      history = GuestReportsAPI.getHistory();
    }
  }

  function viewReport(_reportId: string) {
    if (browser) {
      // Navigate to generic results page; guest report will load from localStorage
      window.location.href = '/results';
    }
  }

  function closeToast() {
    show = false;
    showHistory = false;
  }

  function toggleHistory() {
    showHistory = !showHistory;
  }
</script>

{#if show}
  <div class="fixed bottom-4 right-4 z-50 max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
    <div class="p-4">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-900">Your Job Posting Analysis</h3>
          <p class="mt-1 text-sm text-gray-500">
            View your latest job posting analysis
          </p>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-500"
          on:click={closeToast}
        >
          <span class="sr-only">Close</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div class="mt-4 flex space-x-3">
        <button
          type="button"
          class="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          on:click={() => viewReport('')}
        >
          View
        </button>
        <button
          type="button"
          class="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          on:click={toggleHistory}
        >
          {showHistory ? 'Hide History' : 'History'}
        </button>
      </div>
      
      {#if showHistory && history.length > 0}
        <div class="mt-4 border-t border-gray-200 pt-4">
          <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Reports</h4>
          <ul class="mt-2 space-y-2">
            {#each history as report}
              <li class="flex items-center justify-between text-sm">
                <span class="truncate">{report.job_title || 'Untitled Job'}</span>
                <button
                  type="button"
                  class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  on:click={() => viewReport(report.id)}
                >
                  View
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
{/if}