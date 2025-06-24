<script>
  import { createEventDispatcher } from 'svelte';
  
  // Create a dispatcher for events
  const dispatch = createEventDispatcher();
  
  // Props for the results display
  export let results = null; // Results data from the audit
  export let loading = false; // Loading state
  export let visible = true; // Visibility toggle - defaults to true
  
  // Format the API response scores (0-5 scale) to display format
  $: processedResults = results && {
    ...results,
    clarityScore: results.scores?.clarity || results.clarityScore || 0,
    inclusivityScore: results.scores?.inclusivity || results.inclusivityScore || 0,
    fairnessScore: results.scores?.fairness || results.fairnessScore || 0,
    // Use existing overallScore or calculate from API response
    overallScore: results.overallScore || 
      (((results.scores?.clarity || 0) + 
        (results.scores?.inclusivity || 0) + 
        (results.scores?.fairness || 0)) / 3)
  };
  
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
</script>

<div class="results-page pb-32">
  <!-- Main content area -->
  <div class="max-w-2xl mx-auto py-8 px-4">  
    <h1 class="text-3xl text-center mb-2">Your Reach<b class="text-black">Score</b> Analysis</h1>
    <p class="text-center text-gray-600 mb-8 text-sm">Here's how your job posting performed across key metrics</p>
    
    <!-- Overall Score Circle -->
    <div class="bg-white rounded-lg p-6 mb-8 text-center max-w-md mx-auto">
      <div class="relative h-36 w-36 mx-auto">
        <svg class="w-full h-full" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <!-- Background circle -->
          <circle cx="18" cy="18" r="16" fill="none" stroke="#e0e0e0" stroke-width="2"></circle>
          
          <!-- Progress circle - dynamically calculated -->
          <circle 
            cx="18" cy="18" r="16" 
            fill="none" 
            stroke="#F97316" 
            stroke-width="2"
            stroke-dasharray="100.53 100.53"
            stroke-dashoffset="{100.53 - (processedResults?.overallScore / 5 * 100.53) || 0}"
            transform="rotate(-90 18 18)"
          ></circle>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-bold text-orange-500">{processedResults?.overallScore?.toFixed(1) || '0'}</span>
          <span class="text-sm text-gray-600">out of 5</span>
        </div>
      </div>
      <h3 class="text-lg font-bold mt-4 mb-1">Overall ReachScore</h3>
      <p class="text-sm text-gray-600">Comprehensive posting quality</p>
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
      <!-- Individual Scores -->
      <div class="space-y-4 mb-8">
        <!-- Clarity Score -->
        <div class="border rounded-lg overflow-hidden">
          <div class="flex items-center p-4 gap-3">
            <div class="font-normal text-2xl">Clarity</div>
            <div class="ml-auto flex items-center">
              <span class="font-bold text-xl">{processedResults.clarityScore}</span>
              <span class="text-gray-500 text-sm">/5</span>
            </div>
            <div class="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <span class="text-xs text-gray-600 font-bold">!</span>
            </div>
          </div>
          <div class="bg-white p-4 text-sm">
            Measures how clear, structured, and easy to digest your posting is.
          </div>
        </div>
        
        <!-- Inclusivity Score -->
        <div class="border rounded-lg overflow-hidden">
          <div class="flex items-center p-4 gap-3">
            <div class="font-normal text-2xl">Inclusivity</div>
            <div class="ml-auto flex items-center">
              <span class="font-bold text-xl">{processedResults.inclusivityScore}</span>
              <span class="text-gray-500 text-sm">/5</span>
            </div>
            <div class="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <span class="text-xs font-bold">!</span>
            </div>
          </div>
          <div class="bg-white p-4 text-sm">
            How open and welcoming your language is to people from diverse backgrounds.
          </div>
        </div>
        
        <!-- Fairness Score -->
        <div class="border rounded-lg overflow-hidden">
          <div class="flex items-center p-4 gap-3">
            <div class="font-normal text-2xl">Fairness</div>
            <div class="ml-auto flex items-center">
              <span class="font-bold text-xl">{processedResults.fairnessScore}</span>
              <span class="text-gray-500 text-sm">/5</span>
            </div>
            <div class="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <span class="text-xs font-bold">✓</span>
            </div>
          </div>
          <div class="bg-white p-4 text-sm">
            Evaluates whether expectations and offers are fair, realistic, and transparent.
          </div>
        </div>
      </div>
      
      <!-- Detailed Analysis -->
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
      </div>
    {/if}
  </div>
</div>
<!-- Fallback for no results shown inside component -->

<style>
  
</style>
