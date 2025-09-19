<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { Badge } from '$lib/components/ui/badge';
  import Logo from '$lib/components/Logo.svelte';
  import { GuestReportsAPI } from '$lib/api/reports';

  export let isVisible = false;

  let reportData: any = null;

  onMount(() => {
    if (browser) {
      try {
        // Use consistent API to check for reports
        const history = GuestReportsAPI.getHistory();
        const currentReport = GuestReportsAPI.load();
        
        if (currentReport) {
          // Use current report if available
          reportData = {
            id: currentReport.id || 'current',
            job_title: currentReport.job_title,
            overallScore: currentReport.overallScore || currentReport.total_score
          };
          isVisible = true;
        } else if (history.length > 0) {
          // Use most recent from history
          reportData = history[0];
          isVisible = true;
        }
      } catch (error) {
        console.error('Error loading guest report data:', error);
      }
    }
  });

  function viewLastReport() {
    // Navigate directly to results page
    window.location.href = '/results';
  }

  function getScoreColor(score: number): string {
    if (score >= 75) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  }
</script>

{#if isVisible && reportData}
  <div class="flex justify-center mt-6">
    <button
      on:click={viewLastReport}
      class="inline-flex items-center gap-2 px-4 py-2 rounded-full border-0 transition-all duration-200 hover:shadow-md hover:scale-105 text-gray-600 bg-[#3a3a3a]/20" 
    >
    <!-- {getScoreColor(reportData.overallScore || 0)} -->
      <!-- <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clip-rule="evenodd" />
      </svg> -->
      
      <!-- <Badge variant="secondary" class="bg-blue-500 text-white dark:bg-blue-600">
        <Logo variant="white" style="height: 12px;" />
      </Badge> -->


      <span class="text-xs font-normal">
        Improve Your Lastest JobPost<b>Score</b>: {Math.round(reportData.overallScore || 0)}
      </span>
      
      {#if reportData.job_title}
        <span class="text-xs opacity-75 max-w-32 truncate">
          • {reportData.job_title}
        </span>
      {/if}
      
      <svg class="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
{/if}
