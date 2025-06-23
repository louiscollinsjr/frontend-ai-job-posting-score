<script>
  import { createEventDispatcher } from 'svelte';
  
  // Create a dispatcher for events
  const dispatch = createEventDispatcher();
  
  // Props for the results display
  export let results = null; // Results data from the audit
  export let loading = false; // Loading state
  export let visible = false; // Visibility toggle
  
  // Sample score colors based on ranges
  function getScoreColor(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  // Function to close results
  function closeResults() {
    dispatch('close');
  }
  
  // Function to export results as PDF or text
  function exportResults(format) {
    dispatch('export', { format });
  }
</script>

{#if visible}
<div class="results-container fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
  <div class="results-modal bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
    <!-- Header with close button -->
    <div class="flex justify-between items-center p-6 border-b">
      <h2 class="text-2xl font-bold text-gray-800">Job Posting Audit Results</h2>
      <button 
        class="text-gray-500 hover:text-gray-700 focus:outline-none" 
        on:click={closeResults}
        aria-label="Close results"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Results Content -->
    <div class="p-6">
      {#if loading}
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-lg text-gray-600">Analyzing your job posting...</p>
        </div>
      {:else if results}
        <!-- Overall Score -->
        <div class="mb-8 text-center">
          <h3 class="text-xl font-semibold mb-2">Overall Effectiveness</h3>
          <div class="relative h-32 w-32 mx-auto">
            <svg class="w-full h-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <!-- Background circle -->
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e0e0e0" stroke-width="2"></circle>
              
              <!-- Progress circle - dynamically calculated -->
              <circle 
                cx="18" cy="18" r="16" 
                fill="none" 
                stroke="{results.overallScore >= 80 ? '#10B981' : results.overallScore >= 60 ? '#FBBF24' : '#EF4444'}" 
                stroke-width="2"
                stroke-dasharray="{100.53} {100.53}"
                stroke-dashoffset="{100.53 - (results.overallScore / 100 * 100.53)}"
                transform="rotate(-90 18 18)"
              ></circle>
              
              <!-- Score text -->
              <text x="18" y="18" font-family="Arial" font-size="8" text-anchor="middle" dy=".3em" class="font-bold">
                {results.overallScore}%
              </text>
            </svg>
          </div>
        </div>
        
        <!-- Category Scores -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Inclusivity Score -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Inclusivity</h4>
            <div class="flex items-center">
              <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div class="bg-blue-600 h-2.5 rounded-full" style="width: {results.inclusivityScore}%"></div>
              </div>
              <span class={getScoreColor(results.inclusivityScore)}>{results.inclusivityScore}%</span>
            </div>
            <p class="text-sm text-gray-600 mt-2">{results.inclusivityNotes}</p>
          </div>
          
          <!-- Clarity Score -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Clarity</h4>
            <div class="flex items-center">
              <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div class="bg-purple-600 h-2.5 rounded-full" style="width: {results.clarityScore}%"></div>
              </div>
              <span class={getScoreColor(results.clarityScore)}>{results.clarityScore}%</span>
            </div>
            <p class="text-sm text-gray-600 mt-2">{results.clarityNotes}</p>
          </div>
          
          <!-- Effectiveness Score -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Effectiveness</h4>
            <div class="flex items-center">
              <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div class="bg-green-600 h-2.5 rounded-full" style="width: {results.effectivenessScore}%"></div>
              </div>
              <span class={getScoreColor(results.effectivenessScore)}>{results.effectivenessScore}%</span>
            </div>
            <p class="text-sm text-gray-600 mt-2">{results.effectivenessNotes}</p>
          </div>
        </div>
        
        <!-- Recommendations -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Recommendations</h3>
          <ul class="space-y-2">
            {#each results.recommendations as recommendation}
              <li class="flex items-start">
                <span class="text-indigo-500 mr-2">•</span>
                <span>{recommendation}</span>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Highlighted Issues -->
        {#if results.highlights && results.highlights.length}
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4">Highlighted Issues</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              {#each results.highlights as highlight}
                <div class="mb-4 last:mb-0">
                  <p class="text-gray-800 font-medium">{highlight.text}</p>
                  <p class="text-sm text-gray-600 mt-1">{highlight.suggestion}</p>
                </div>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- Export Options -->
        <div class="flex justify-end space-x-4 border-t pt-4 mt-8">
          <button 
            class="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none"
            on:click={() => exportResults('pdf')}
          >
            Export as PDF
          </button>
          <button 
            class="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            on:click={() => exportResults('text')}
          >
            Export as Text
          </button>
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-600">No results available</p>
        </div>
      {/if}
    </div>
  </div>
</div>
{/if}
