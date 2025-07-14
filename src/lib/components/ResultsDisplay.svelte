<script>
  import { createEventDispatcher } from 'svelte';
  
  // Create a dispatcher for events
  const dispatch = createEventDispatcher();
  
  // Props for the results display
  export let results = null; // Results data from the audit
  export let loading = false; // Loading state
  export let isLoggedIn = false; // Authentication state
  
  // Format the API response for new 7-category, 100-point rubric
  $: processedResults = results && {
    ...results,
    overallScore: results.totalScore || results.overallScore || 0,
    categories: results.categories || {},
    redFlags: results.redFlags || [],
    recommendations: results.recommendations || []
  };
  
  // Function to determine which score background to use based on score value
  function getScoreBackground(score) {
    if (score >= 96.0) return '/green-score.svg';
    if (score >= 75.0) return '/yellow-score.svg';
    return '/red-score.svg';
  }

  // Category display order and labels
  const categoryLabels = [
    { key: 'clarity', label: 'Clarity & Readability', max: 20 },
    { key: 'promptAlignment', label: 'Prompt Alignment', max: 20 },
    { key: 'structuredData', label: 'Structured Data Presence', max: 15 },
    { key: 'recency', label: 'Recency & Freshness', max: 10 },
    { key: 'keywordTargeting', label: 'Keyword Targeting', max: 15 },
    { key: 'compensation', label: 'Compensation Transparency', max: 10 },
    { key: 'pageContext', label: 'Page Context & Cleanliness', max: 10 }
  ];

  function getScoreColor100(score, max) {
    const pct = score / max;
    if (pct >= 0.85) return 'text-green-600';
    if (pct >= 0.6) return 'text-yellow-600';
    if (pct >= 0.4) return 'text-orange-500';
    return 'text-red-600';
  }
  
  // Function to get score color
  function getScoreColor(score) {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    if (score >= 2) return 'text-orange-500';
    return 'text-red-600';
  }
  
  // Function to analyze another job posting
  function analyzeAnother() {
    dispatch('close');
    // Navigate back to form
    window.history.back();
  }
  
  // Function to download report
  function downloadReport() {
    dispatch('export', { format: 'pdf' });
  }
  
  // Function to get improvement tips
  function getImprovementTips() {
    dispatch('tips');
  }
  
  // Function to download job data as a text file
  async function downloadJobData() {
    try {
      const response = await fetch(`/api/analyze-job/${results.id}`);
      const data = await response.json();
      
      // Convert data to text format
      const textData = JSON.stringify(data, null, 2);
      
      // Create a blob and trigger download
      const blob = new Blob([textData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_${results.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading job data:', error);
    }
  }
</script>

<div class="results-page pb-32">
  <!-- Main content area -->
  <div class="max-w-2xl mx-auto pb-8 px-4">  
    <h1 class="text-3xl text-center mb-2">Your Intelli<b class="text-black">Score</b> Analysis</h1>
    <p class="text-center text-gray-600 mb-8 text-sm">Here's how your job posting performed across key metrics</p>
    
    <!-- Overall Score Circle (100-point scale) -->
    <div class="bg-white p-6 mb-24 text-center max-w-md mx-auto">
      <!-- Larger container for score display with proper spacing -->
      <div class="relative h-64 w-64 mx-auto sm:h-72 sm:w-80 md:h-80 md:w-80">
        <!-- SVG Score Background -->
        <div class="absolute inset-0 flex items-center justify-center">
          {#if processedResults?.overallScore}
            <img 
              src={getScoreBackground(processedResults.overallScore)} 
              alt="Score background" 
              class="w-full h-full object-contain" 
              style="transform: scale(1.5);"
            />
          {:else}
            <img 
              src="/yellow-score.svg" 
              alt="Default score background" 
              class="w-full h-full object-contain"
              style="transform: scale(1.5);"
            />
          {/if}
        </div>
        <!-- Score text positioned in center with z-index to appear above background -->
        <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div class="bg-transparent p-4 pl-1">
            <span class="text-5xl font-bold {processedResults?.overallScore >= 96.0 ? 'text-green-600' : processedResults?.overallScore >= 75.0 ? 'text-yellow-600' : 'text-red-500'}">{processedResults?.overallScore?.toFixed(1) || '0'}</span>
            <span class="text-sm text-gray-600 block">out of 100</span>
          </div>
        </div>
      </div>
      <h3 class="text-lg font-bold mt-8 mb-2">JobPostScore</h3>
      <p class="text-sm text-gray-600">Job Post Visibility & Quality Index</p>
    </div>
    
    {#if loading}
      <div class="flex flex-col items-center justify-center py-12">
        <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg text-gray-600">Analyzing your job posting...</p>
      </div>
    {:else if processedResults}
      
      {#if isLoggedIn}
        <!-- Category Breakdown Table (Only for authenticated users) -->
        <div class="space-y-4 mb-8">
          <table class="w-full text-left border rounded-lg overflow-hidden">
            <thead>
              <tr class="bg-gray-50">
                <th class="py-2 px-4">Category</th>
                <th class="py-2 px-4">Score</th>
                <th class="py-2 px-4">Max</th>
                <th class="py-2 px-4">Suggestions</th>
              </tr>
            </thead>
            <tbody>
              {#each categoryLabels as cat}
                <tr class="border-b">
                  <td class="py-2 px-4 font-medium">{cat.label}</td>
                  <td class="py-2 px-4 {getScoreColor100(processedResults.categories?.[cat.key]?.score || 0, cat.max)}">
                    {processedResults.categories?.[cat.key]?.score ?? '-'}
                  </td>
                  <td class="py-2 px-4 text-gray-500">{cat.max}</td>
                  <td class="py-2 px-4 text-xs text-gray-600">
                    {#if processedResults.categories?.[cat.key]?.suggestions?.length}
                      <ul class="list-disc pl-4">
                        {#each processedResults.categories[cat.key].suggestions as sugg}
                          <li>{sugg}</li>
                        {/each}
                      </ul>
                    {:else}-{/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <!-- Message for unauthenticated users -->
        <div class="bg-gray-100 border border-gray-200 rounded-lg p-6 mb-8 text-center py-12">
          <h3 class="font-semibold text-gray-800 mb-6">Sign in to view detailed results</h3>
          <p class="text-sm text-gray-700">Provide your email to unlock the complete audit report with category breakdowns, suggestions, and detailed analysis.</p>
        </div>
      {/if}

      {#if isLoggedIn}
        <!-- Red Flags (Only for authenticated users) -->
        {#if processedResults.redFlags?.length}
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="font-semibold text-red-700 mb-1">Red Flags</div>
            <ul class="list-disc pl-5 text-sm text-red-700">
              {#each processedResults.redFlags as flag}
                <li>{categoryLabels.find(c => c.key === flag)?.label || flag}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Recommendations (Only for authenticated users) -->
        {#if processedResults.recommendations?.length}
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="font-semibold text-blue-700 mb-1">Optimization Suggestions</div>
            <ul class="list-disc pl-5 text-sm text-blue-700">
              {#each processedResults.recommendations as rec}
                <li>{rec}</li>
              {/each}
            </ul>
          </div>
        {/if}
        
        <!-- Detailed Analysis (Only for authenticated users) -->
        <div class="border rounded-lg p-6 mb-8">
          <h2 class="flex items-center gap-2 text-xl mb-6">
            Detailed Analysis & Recommendations
          </h2>
          
          <!-- Render the feedback directly from the API response -->
          <div class="space-y-4 text-gray-700 leading-relaxed text-sm">
            <p>{processedResults.feedback || ''}</p>
            
            {#if processedResults.jobTitle}
            <p class="font-medium">Job Title: {processedResults.jobTitle}</p>
            {/if}
          </div>
        </div>
      {/if}
      
      <!-- Action buttons -->
      <div class="flex flex-wrap justify-center gap-4 mt-8">
        <button 
          on:click={downloadReport}
          class="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download Report
        </button>
        
        <button 
          on:click={analyzeAnother}
          class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Analyze Another Posting
        </button>
        
        <button 
          on:click={getImprovementTips}
          class="px-6 py-3 bg-white font-medium rounded-lg hover:bg-gray-100 transition-colors premium-btn"
        >
          <span class="text-sm text-gray-500">Upgrade for improvement tips</span>
        </button>
        
        <button 
          on:click={downloadJobData}
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download Job Data
        </button>
      </div>
    {/if}
  </div>
</div>
<!-- Fallback for no results shown inside component -->

<style>
  
</style>
