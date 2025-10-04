<script lang="ts">
  import { goto } from '$app/navigation';
  import { resultsPageStore } from '$lib/stores/resultsPage';
  import JobOptimizationExecutive from '$lib/components/JobOptimizationExecutive.svelte';
	import Logo from '$lib/components/Logo.svelte';

  $: rewriteData = $resultsPageStore.rewriteData;
  $: currentReport = $resultsPageStore.currentReport;
  
  // Debug logging
  $: if (import.meta.env.DEV) {
    console.log('[OptimizationView] Store state:', {
      hasRewriteData: !!rewriteData,
      hasCurrentReport: !!currentReport,
      requestedView: $resultsPageStore.requestedView
    });
  }

  async function handleBackToResults() {
    console.log('[DEBUG] OptimizationView: Going back to original view');
    
    // Set the requested view to original first
    resultsPageStore.setRequestedView('original');
    
    // Navigate to URL without view parameter - this will trigger the page reactive logic
    const reportId = currentReport?.id || currentReport?.report_id;
    if (reportId) {
      await goto(`/results?report=${reportId}`, { replaceState: true });
    }
  }
</script>

{#if rewriteData}
  <!-- <button 
    class="back-button mt-24 px-4 py-2 bg-black hover:bg-gray-700 text-white text-xs rounded-md transition-colors duration-200 flex items-center gap-2" 
    on:click={handleBackToResults}
    on:keydown={(e) => e.key === 'Enter' && handleBackToResults()}
  >
    ← See Original <Logo variant="white" imgClass="h-4 w-auto sm:h-4" />
  </button> -->

  <JobOptimizationExecutive 
    originalText={rewriteData.original_text || currentReport?.original_report?.text || ''}
    improvedText={rewriteData.improvedText || ''}
    reportId={rewriteData.id}
    initialData={rewriteData.optimizationData as any}
    recommendations={rewriteData.recommendations || []}
    score={rewriteData.score || 0}
  />
{/if}
