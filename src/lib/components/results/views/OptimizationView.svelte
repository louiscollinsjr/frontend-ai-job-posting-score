<script lang="ts">
  import { resultsPageStore } from '$lib/stores/resultsPage';
  import JobOptimizationExecutive from '$lib/components/JobOptimizationExecutive.svelte';

  $: rewriteData = $resultsPageStore.rewriteData;
  $: currentReport = $resultsPageStore.currentReport;

  function handleBackToResults() {
    resultsPageStore.setRewriteData(null);
  }
</script>

{#if rewriteData}
  <button 
    class="back-button mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 flex items-center gap-2" 
    on:click={handleBackToResults}
    on:keydown={(e) => e.key === 'Enter' && handleBackToResults()}
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
    </svg>
    Back to Results
  </button>

  <JobOptimizationExecutive 
    originalText={rewriteData.original_text || currentReport?.original_report?.text || ''}
    improvedText={rewriteData.improvedText || ''}
    reportId={rewriteData.id}
    initialData={rewriteData.optimizationData}
    recommendations={rewriteData.recommendations || []}
    score={rewriteData.score || 0}
  />
{/if}
