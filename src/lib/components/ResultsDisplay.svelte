<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import ScoreVisualizer from '$lib/components/ScoreVisualizer.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import SaveReportDialog from '$lib/components/SaveReportDialog.svelte';
  import { getScoreColorHex100 as utilGetScoreColorHex100, getTextColorClass100 as utilGetTextColorClass100 } from '$lib/utils/colors';
  // Safe defaults to avoid runtime ReferenceErrors when props not provided by parent
  export let printPageSize = 'a4'; // 'a4' | 'letter'
  export let loading = false;
  export let isLoggedIn = false;
  export let results = null;
  export let categoryLabels = [];
  export let rewriteLoading = false;

  const dispatch = createEventDispatcher();
  export let downloadReport = () => {};
  export let downloadJobData = () => {};
  
  // SaveReportDialog state
  let showSaveDialog = false;
  
  // Handle save report dialog submission
  function handleSaveReportSubmit(event) {
    const { email, report } = event.detail;
    console.log('Save report submitted:', { email, report });
    // You can dispatch this to parent component for handling
    dispatch('save-report', { email, report });
    showSaveDialog = false;
  }

  // Map incoming results to the expected internal structure
  let processedResults = null;
  $: processedResults = results
    ? {
        ...results,
        // Use original score if optimization exists (to match category breakdown)
        // Otherwise use total_score (no optimization, scores match)
        overallScore: results?.hasRewrite && results?.optimizationData?.original_score
          ? results.optimizationData.original_score
          : (results?.overallScore ?? results?.total_score ?? results?.totalScore ?? 0),
        // Ensure categories is an object
        categories: results?.categories ?? {},
      }
    : null;

  // Debug logging for hasRewrite issue (temporary)
  $: if (results && import.meta.env.DEV) {
    console.log('[ResultsDisplay] Report ID:', results?.id);
    console.log('[ResultsDisplay] hasRewrite:', results?.hasRewrite);
    console.log('[ResultsDisplay] Has improved_text?', !!results?.improved_text);
    console.log('[ResultsDisplay] Has optimizationData?', !!results?.optimizationData);
    console.log('[ResultsDisplay] rewriteVersion:', results?.rewriteVersion);
    console.log('[ResultsDisplay] Score selection:', {
      hasRewrite: results?.hasRewrite,
      originalScore: results?.optimizationData?.original_score,
      totalScore: results?.total_score,
      selectedScore: results?.hasRewrite && results?.optimizationData?.original_score
        ? results.optimizationData.original_score
        : (results?.overallScore ?? results?.total_score ?? results?.totalScore ?? 0)
    });
  }

  // Default labels and max values matching actual backend scoring system
  const DEFAULT_CATEGORY_LABELS = [
    { key: 'structuredData', label: 'Structured Data', max: 15 },
    { key: 'compensation', label: 'Compensation', max: 10 },
    { key: 'clarity', label: 'Clarity', max: 20 },
    { key: 'promptAlignment', label: 'Prompt Alignment', max: 20 },
    { key: 'keywordTargeting', label: 'Keyword Targeting', max: 15 },
    { key: 'recency', label: 'Recency', max: 10 },
    { key: 'pageContext', label: 'Page Context', max: 10 }
  ];

  // Choose effective labels
  $: effectiveCategoryLabels = (categoryLabels && categoryLabels.length)
    ? categoryLabels
    : DEFAULT_CATEGORY_LABELS;

  // Helper to resolve keys from camelCase to snake_case in DB if necessary
  const toSnakeCase = (str) => str.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());

  // Normalize a category object to always have an array suggestions field
  function normalizeCategory(val) {
    if (!val || typeof val !== 'object') return null;
    let suggestions = val.suggestions;
    if (typeof suggestions === 'string') {
      try { suggestions = JSON.parse(suggestions); } catch {}
    }
    if (!Array.isArray(suggestions)) suggestions = [];
    return { ...val, suggestions };
  }

  // Build a categories map that always uses camelCase keys expected by UI
  $: resolvedCategories = (() => {
    const src = processedResults?.categories || {};
    const out = {};
    for (const cat of effectiveCategoryLabels) {
      const k = cat.key;
      const snake = toSnakeCase(k);
      let raw = src[k] ?? src[snake] ?? null;
      // If category itself is a JSON string, try to parse
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch {}
      }
      out[k] = normalizeCategory(raw);
    }
    return out;
  })();

  // Fallback: top-level recommendations array (or JSON string)
  $: generalRecommendations = (() => {
    let rec = processedResults?.recommendations ?? [];
    if (typeof rec === 'string') {
      try { rec = JSON.parse(rec); } catch {}
    }
    return Array.isArray(rec) ? rec : [];
  })();

  // Whether any category has suggestions
  $: hasAnyCategorySuggestions = effectiveCategoryLabels.some(
    (cat) => Array.isArray(resolvedCategories?.[cat.key]?.suggestions) && resolvedCategories[cat.key].suggestions.length > 0
  );

  // Compute sorted categories for print view
  $: sortedCategories = effectiveCategoryLabels
    .map(cat => ({
      ...cat,
      data: resolvedCategories?.[cat.key],
      score: resolvedCategories?.[cat.key]?.score || 0,
      percentage: ((resolvedCategories?.[cat.key]?.score || 0) / cat.max) * 100
    }))
    .filter(cat => cat.data?.suggestions?.length)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  // Helper functions for score colors
  function getScoreColor100(score) {
    return utilGetTextColorClass100(score, 100);
  }
  
  function getScoreColorHex100(score) {
    return utilGetScoreColorHex100(score, 100);
  }
</script>

<div class="results-page pb-32 bg-[#f8f8f8]/0 print:bg-white print:pb-0">
  <!-- Wide container for navigation (screen only) -->
  {#if isLoggedIn}
    <div class="max-w-6xl mx-auto px-4 print:hidden">
      <div class="py-6 pt-24">
        <button
          class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-black text-white shadow-sm hover:bg-gray-800 h-10 gap-1.5 px-4"
          on:click={() => goto('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  {/if}

  <!-- Main content container -->
  <div id="print-root" class="max-w-2xl mx-auto pb-8 px-4 print:mx-auto print:bg-white print:shadow-none print:px-0 print:pb-0" class:print-a4={printPageSize === 'a4'} class:print-letter={printPageSize === 'letter'}>
    <!-- Screen Layout -->
    <div class="print:hidden" id="screen-content">
      {#if loading}
        <div class="flex flex-col items-center justify-center py-12">
          <svg
            class="animate-spin h-10 w-10 text-indigo-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg text-gray-600">Analyzing your job posting...</p>
        </div>
      {:else if processedResults}
        {#if isLoggedIn}
          <!-- Full Score Visualizer and detailed breakdown for authenticated users -->
          <div class="space-y-4 mb-2 print:space-y-2">
            <ScoreVisualizer
              score={processedResults?.overallScore || 0}
              categories={resolvedCategories}
              categoryLabels={effectiveCategoryLabels}
            />

            <!-- Suggestions Panel -->
            <div
              class="mt-2 p-6 bg-white rounded-lg shadow-sm border border-r-2 border-black border-b-2 avoid-break print:p-4"
            >
              <h3 class="text-xl font-bold uppercase mb-3">Improvement Suggestions</h3>
              {#if processedResults.job_title}
                <div class="mb-4 text-gray-400">
                  <p class="font-normal text-xs">Job Title: {processedResults.job_title}</p>
                  <!--job uuid -->
                  <p class="font-normal text-xs">JobPostScore ID: {processedResults.id}</p>
                   <!-- job url - only show if exists -->
                {#if processedResults.job_url}
                <a href={processedResults.job_url} class="font-normal text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Job URL: {processedResults.job_url}</a>
              {/if}
                </div>
              {/if}
              {#each effectiveCategoryLabels as cat}
                {#if resolvedCategories?.[cat.key]?.suggestions?.length}
                  <div class="mb-4">
                    <h4 class="font-medium text-sm mb-1">{cat.label}</h4>
                    <ul class="list-disc pl-4 text-sm text-gray-700">
                      {#each resolvedCategories[cat.key].suggestions as sugg}
                        <li class="mb-1">{sugg}</li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              {/each}
              {#if !hasAnyCategorySuggestions && generalRecommendations.length}
                <div class="mb-4">
                  <h4 class="font-medium text-sm mb-1">General Recommendations</h4>
                  <ul class="list-disc pl-4 text-sm text-gray-700">
                    {#each generalRecommendations as sugg}
                      <li class="mb-1">{sugg}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap justify-center gap-4 mt-8 bg-gray-100 p-6 rounded-lg py-12 print:hidden no-print" data-no-print>
            <button 
              class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 gap-1.5 px-3"
              on:click={downloadReport}
            >
              Download Report
            </button>

            <button 
              class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 gap-1.5 px-3"
              id="downloadButton" 
              on:click={() => goto(`/json-ld?report=${results.id}`)}
            >
              Download JSON-LD Data
            </button>

            <!-- Improvement Status & Action -->
            {#if results?.hasRewrite}
              <div class="flex items-center gap-2">
                <div class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  Improved v{results.rewriteVersion || 1}
                </div>
                <a
                  href="/results?report={results.id}&view=optimized"
                  class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/90 h-8 gap-1.5 px-3 no-underline"
                  on:click={(e) => {
                    if (rewriteLoading || loading) {
                      e.preventDefault();
                      return false;
                    }
                    console.log('[DEBUG] View Latest Improvement clicked, navigating to:', `/results?report=${results.id}&view=optimized`);
                  }}
                  class:opacity-50={rewriteLoading || loading}
                  class:pointer-events-none={rewriteLoading || loading}
                >
                  {rewriteLoading ? 'Viewing...' : 'View Latest Improvement'}
                </a>
              </div>
            {:else}
              <button
                class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 gap-1.5 px-3"
                on:click={() => dispatch('optimize')}
                disabled={rewriteLoading || loading}
              >
                {rewriteLoading ? 'Improving...' : 'Improve This Posting'}
              </button>
            {/if}
          </div>
        {:else}
          <!-- Always show the score prominently with progress circle -->
          <div class="text-center sm:mt-32 mb-8 avoid-break print:mb-4">
            <h1 class="text-3xl mb-2 whitespace-nowrap flex items-center justify-center gap-2 leading-none">
              <Logo variant="black" alt="JobPostScore" imgClass="h-7 sm:h-10 w-auto align-middle" />
              <span class="align-middle">Analysis</span>
            </h1>
            <p class="text-center text-gray-600 mb-12 text-sm">Here's how your job posting performed across key metrics</p>
            
            <div class="relative flex justify-center">
              <div class="relative w-48 h-48 print:w-48 print:h-48">
                <!-- SVG Circle Progress -->
                <svg class="w-full h-full" viewBox="0 0 100 100">
                  <defs>
                    <!-- Circular gradient that smoothly transitions and returns to starting color -->
                    <!-- <linearGradient id="circularScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
                      <stop offset="25%" style="stop-color:#ff6900;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#ffe020;stop-opacity:1" />
                      <stop offset="75%" style="stop-color:#16a34a;stop-opacity:1" />
                      <stop offset="90%" style="stop-color:#16a34a;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
                    </linearGradient> -->
                    
                    <!-- Dynamic gradient that matches category breakdown style (darker to lighter) -->
                    <linearGradient id="dynamicScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      {#if (processedResults?.overallScore || 0) >= 85}
                        <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#16a34a;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#166534;stop-opacity:1" />
                      {:else if (processedResults?.overallScore || 0) >= 60}
                        <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#eab308;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ca8a04;stop-opacity:1" />
                      {:else}
                        <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#dc2626;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
                      {/if}
                    </linearGradient>
                  </defs>
                  
                  <!-- Background circle -->
                  <circle cx="50" cy="50" r="42" stroke="#e5e7eb" stroke-width="8" fill="none" />
                  
                  <!-- Progress circle with beautiful gradient -->
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#dynamicScoreGradient)"
                    stroke-width="8"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray={2 * Math.PI * 42}
                    stroke-dashoffset={2 * Math.PI * 42 - ((processedResults?.overallScore || 0) / 100) * 2 * Math.PI * 42}
                    transform="rotate(-90 50 50)"
                    class="transition-all duration-1000 ease-in-out"
                  />
                </svg>

                <!-- Score value -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-5xl font-bold text-black">{Math.round(processedResults?.overallScore || 0)}</span>
                  <span class="text-xs text-gray-500">(0-100)</span>
                </div>
              </div>
            </div>
            
            <!-- <h3 class="text-lg font-bold mt-12 mb-2 text-center">JobPostScore</h3>
            <p class="text-sm text-gray-600 text-center mb-20">Job Post Visibility & Quality Index</p> -->
          </div>

          <div class="text-center"> <!-- Wrapper for guest content -->
            <h3
              class="text-[23px] font-bold text-gray-800 mb-2 flex items-center justify-center gap-1 mt-16"
            >
              Your <Logo
                variant="black"
                alt="JobPostScore"
                imgClass="h-7 sm:h-7 w-auto align-middle ml-1"
              /><span class="">Score</span>
            </h3>
            
            {#if processedResults.job_title}
              <div class="mb-4 text-gray-400">
                <p class="font-normal text-xs">Job Title: {processedResults.job_title}</p>
                <!--job uuid -->
                <p class="font-normal text-xs">JobPostScore ID: {processedResults.id}</p>
                <!-- job url - only show if exists -->
                {#if processedResults.job_url}
                  <a href={processedResults.job_url} class="font-normal text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Job URL: {processedResults.job_url}</a>
                {/if}
              </div>
            {/if}

            <div class="bg-gray-50 border border-black border-b-2 border-r-2 rounded-lg p-8 py-12 mt-24 mb-16 text-center avoid-break print:hidden">
              <h3 class="text-2xl font-bold text-gray-800 mb-4">Want to improve your score?</h3>
              <p class="text-gray-600 mb-6">Create a free account to unlock detailed insights, get improvement suggestions, and save your progress.</p>
              <button 
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-6"
                on:click={() => showSaveDialog = true}
              >
                Save & Improve This Report
              </button>
              <p class="text-xs text-gray-500 mt-3">Free account • No credit card required</p>
            </div>
          </div> <!-- Close guest wrapper div -->
        {/if}
      {/if}
    </div> <!-- End screen-content -->
    
    <!-- Print Layout -->
    <div class="hidden print:block print:text-sm print:leading-tight" id="print-content">
      {#if processedResults}
        {#if isLoggedIn}
          <!-- Full Executive Report for Authenticated Users -->
        {@const overallScore = Math.round(processedResults?.overallScore || 0)}
        {@const scoreColor = overallScore >= 75 ? 'text-green-600' : overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'}
        {@const scoreBg = overallScore >= 75 ? 'bg-green-50' : overallScore >= 50 ? 'bg-yellow-50' : 'bg-red-50'}
        
        <!-- Executive Header -->
        <div class="print:mb-6">
          <div class="print:flex print:items-center print:justify-between print:mb-4">
            <div>
              <!-- Branded logo -->
              <div class="print:flex print:items-center print:gap-2 print:mb-1">
                <Logo variant="black" alt="JobPostScore Logo" imgClass="print:h-6" />
                <h1 class="print:text-xl print:font-bold print:text-gray-800">Executive Report</h1>
              </div>
              {#if processedResults.job_title}
                <p class="print:text-xs print:text-gray-600 print:mb-0.5">{processedResults.job_title}</p>
                <p class="print:text-xs print:text-gray-500">Report ID: {processedResults.id}</p>
              {/if}
            </div>
            
            <!-- Hero Overall Score -->
            <div class="print:text-center print:px-6 print:py-4 print:rounded-lg print:bg-gray-100">
              <div class="print:text-5xl print:font-bold print:leading-none print:text-black">{overallScore}</div>
              <div class="print:text-xs print:text-gray-600 print:mt-1">Overall Score</div>
              <div class="print:text-xs print:text-gray-500">(0-100)</div>
            </div>
          </div>
        </div>
        
        <!-- Category Performance Grid -->
        <div class="print:mb-6">
          <h2 class="print:text-base print:font-bold print:text-gray-800 print:mb-3">Performance Breakdown</h2>
          <div class="print:grid print:grid-cols-2 print:gap-3">
            {#each effectiveCategoryLabels as cat}
              {@const categoryData = resolvedCategories?.[cat.key]}
              {@const categoryScore = categoryData?.score || 0}
              {@const percentage = (categoryScore / cat.max) * 100}
              {@const actionText = percentage >= 75 ? 'Strong' : percentage >= 50 ? 'Improving' : 'Needs review'}
              {@const gradientClass = percentage >= 75 ? 'bg-gradient-to-r from-green-800 via-green-500 to-green-500' : percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300' : 'bg-gradient-to-r from-red-800 via-red-500 to-red-500'}
              
              <div class="print:break-inside-avoid print:p-3 print:bg-gray-50 print:rounded-xl print:border print:border-gray-200">
                <!-- Category Header -->
                <div class="print:flex print:justify-between print:items-baseline print:mb-2">
                  <h3 class="print:font-semibold print:text-sm print:text-gray-800">{cat.label}</h3>
                  <span class="print:text-xs print:font-normal print:text-black">{actionText}</span>
                </div>
                
                <!-- Progress Bar -->
                <div class="print:w-full print:bg-gray-200 print:rounded-full print:h-2 print:mb-2">
                  <div class="print:h-2 print:rounded-full {gradientClass}" style="width: {Math.max(percentage, 2)}%"></div>
                </div>
                
                <!-- Top Suggestions -->
                {#if categoryData?.suggestions?.length}
                  <div class="print:text-xs print:text-gray-600">
                    {#each categoryData.suggestions.slice(0, 3) as suggestion}
                      <div class="print:mb-1">• {suggestion}</div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
        
        <!-- Top 3 Fixes Section -->
        <div class="print:mb-4">
          <h2 class="print:text-base print:font-bold print:text-gray-800 print:mb-3">Top 3 Priority Fixes</h2>
          
          <div class="print:space-y-2">
            {#each sortedCategories as cat, index}
              {@const isQuickFix = ['structuredData', 'recency', 'compensation'].includes(cat.key)}
              <div class="print:flex print:items-start print:gap-3 print:p-2 print:bg-gray-50 print:rounded">
                <span class="print:font-bold print:text-sm print:text-gray-600 print:mt-0.5">{index + 1}.</span>
                <div class="print:flex-1">
                  <div class="print:flex print:items-center print:gap-2 print:mb-1">
                    <span class="print:font-semibold print:text-sm">{cat.label}</span>
                    <span class="print:text-xs print:px-2 print:py-0.5 print:rounded print:font-medium print:bg-gray-100 print:text-gray-700 print:inline-flex print:items-center print:gap-1">
                      <img src="/check_jps.svg" alt="Quick" class="print:h-3 print:w-3" style="filter: invert(34%) sepia(98%) saturate(704%) hue-rotate(86deg) brightness(92%) contrast(101%)" />
                      {isQuickFix ? 'Quick' : 'Medium effort'}
                    </span>
                  </div>
                  <p class="print:text-xs print:text-gray-700">{cat.data.suggestions[0]}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
        
        <!-- Professional Footer -->
        <div class="print:border-t print:border-gray-200 print:pt-2 print:mt-4">
          <div class="print:flex print:justify-between print:items-center print:text-xs print:text-gray-500">
            <span>Generated by JobPostScore 2025</span>
            <span>Report generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} Page 1</span>
          </div>
        </div>
      {/if}
      {:else}
        <!-- Simple Score Print for Guest Users -->
        <div class="print:text-center print:py-12">
          <div class="print:flex print:items-center print:justify-center print:gap-2 print:mb-6">
            <Logo variant="black" alt="JobPostScore" imgClass="print:h-8" />
            <h1 class="print:text-2xl print:font-bold print:text-gray-800">Analysis</h1>
          </div>
          
          {#if processedResults.job_title}
            <p class="print:text-sm print:text-gray-600 print:mb-8">{processedResults.job_title}</p>
          {/if}
          
          <div class="print:inline-block print:px-8 print:py-6 print:bg-gray-100 print:rounded-lg">
            <div class="print:text-6xl print:font-bold print:text-black print:mb-2">{Math.round(processedResults?.overallScore || 0)}</div>
            <div class="print:text-sm print:text-gray-600">Overall Score (0-100)</div>
          </div>
          
          <div class="print:mt-8">
            <h3 class="print:text-lg print:font-bold print:mb-2">JobPostScore</h3>
            <p class="print:text-sm print:text-gray-600">Job Post Visibility & Quality Index</p>
          </div>
          
          <div class="print:mt-8 print:pt-4 print:border-t print:text-xs print:text-gray-500">
            <p>Create a free account at jobpostingscore.com for detailed insights and improvement suggestions</p>
          </div>
        </div>
      {/if}
    </div> <!-- End print-content -->
    
  </div> <!-- End #print-root -->
</div> <!-- End .results-page -->

{#if !loading && !processedResults}
  <!-- Fallback content -->
{/if}

<!-- Save Report Dialog -->
<SaveReportDialog 
  bind:open={showSaveDialog}
  report={processedResults}
  on:submit={handleSaveReportSubmit}
/>

<style>
  /* Component-scoped utilities for printing */
  :global(.avoid-break) {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  @page {
    size: A4;
    margin: 8mm; /* Professional margins for executive reports */
  }

  @media print {
    /* Ensure colors are preserved when printing and force light mode */
    :global(html), :global(body) {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #ffffff !important;
      color: #000 !important;
      margin: 0 !important;
      padding: 0 !important;
      font-size: 9pt !important;
      line-height: 1.2 !important;
    }

    :global(.results-page),
    :global(.results-page-container) {
      background: #ffffff !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Constrain printable width per selected paper size */
    :global(#print-root.print-a4) {
      width: 190mm !important;
      max-width: 190mm !important;
    }
    :global(#print-root.print-letter) {
      width: 7.5in !important;
      max-width: 7.5in !important;
    }
    :global(#print-root) {
      margin: 0 auto !important;
      padding: 8mm !important;
      overflow: visible;
    }

    :global(#print-content) {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      /* Remove any scaling - rely purely on CSS layout */
      transform: none !important;
    }

    :global(.results-page) {
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Optimize spacing for print tiles */
    :global(.print\\:gap-4) {
      gap: 8px !important;
    }
    
    :global(.print\\:p-2) {
      padding: 6px !important;
    }
    
    :global(.print\\:mb-4) {
      margin-bottom: 12px !important;
    }
    
    :global(.print\\:mt-6) {
      margin-top: 16px !important;
    }

    /* Ensure tiles don't break across pages */
    :global(.print\\:break-inside-avoid) {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* Typography optimizations */
    :global(.print\:text-lg) {
      font-size: 14pt !important;
      line-height: 1.2 !important;
    }
    
    :global(.print\:text-base) {
      font-size: 11pt !important;
      line-height: 1.3 !important;
    }
    
    :global(.print\:text-sm) {
      font-size: 9pt !important;
      line-height: 1.2 !important;
    }
    
    :global(.print\:text-xs) {
      font-size: 8pt !important;
      line-height: 1.1 !important;
    }
    
    :global(.print\:text-5xl) {
      font-size: 36pt !important;
      line-height: 1 !important;
    }
    
    /* Color utilities for print */
    :global(.print\:text-red-600) {
      color: #dc2626 !important;
    }
    
    :global(.print\:text-yellow-600) {
      color: #d97706 !important;
    }
    
    :global(.print\:text-green-600) {
      color: #059669 !important;
    }
    
    :global(.print\:bg-red-50) {
      background-color: #fef2f2 !important;
    }
    
    :global(.print\:bg-yellow-50) {
      background-color: #fffbeb !important;
    }
    
    :global(.print\:bg-green-50) {
      background-color: #f0fdf4 !important;
    }
    
    :global(.print\:bg-red-25) {
      background-color: #fefefe !important;
      border-left: 2px solid #fca5a5 !important;
    }
    
    :global(.print\:border-red-400) {
      border-color: #f87171 !important;
    }

    /* List spacing optimization */
    :global(.print\:space-y-0\.5 > * + *) {
      margin-top: 1px !important;
    }
    
    :global(.print\:space-y-1 > * + *) {
      margin-top: 2px !important;
    }
    
    :global(.print\:space-y-2 > * + *) {
      margin-top: 4px !important;
    }
    
    /* Enhanced spacing for executive layout */
    :global(.print\:gap-3) {
      gap: 6px !important;
    }
    
    :global(.print\:mb-6) {
      margin-bottom: 18px !important;
    }
    
    :global(.print\:mb-3) {
      margin-bottom: 9px !important;
    }
    
    :global(.print\:p-3) {
      padding: 9px !important;
    }
    
    :global(.print\:px-6) {
      padding-left: 18px !important;
      padding-right: 18px !important;
    }
    
    :global(.print\:py-4) {
      padding-top: 12px !important;
      padding-bottom: 12px !important;
    }
    
    :global(.print\:rounded-lg) {
      border-radius: 6px !important;
    }
    
    :global(.print\:rounded) {
      border-radius: 3px !important;
    }
    
    :global(.print\:rounded-xl) {
      border-radius: 9px !important;
    }
    
    /* Gradient backgrounds for print */
    :global(.print\:bg-gradient-to-r.from-red-800.via-red-500.to-red-500) {
      background: linear-gradient(to right, #991b1b, #ef4444, #ef4444) !important;
    }
    
    :global(.print\:bg-gradient-to-r.from-yellow-500.via-yellow-400.to-yellow-300) {
      background: linear-gradient(to right, #eab308, #facc15, #fde047) !important;
    }
    
    :global(.print\:bg-gradient-to-r.from-green-800.via-green-500.to-green-500) {
      background: linear-gradient(to right, #166534, #22c55e, #22c55e) !important;
    }
    
    /* Print-specific flex utilities */
    :global(.print\:inline-flex) {
      display: inline-flex !important;
    }
    
    :global(.print\:items-center) {
      align-items: center !important;
    }
    
    :global(.print\:gap-1) {
      gap: 3px !important;
    }
    
    :global(.print\:h-3) {
      height: 9pt !important;
    }
    
    :global(.print\:w-3) {
      width: 9pt !important;
    }
    
    :global(.print\:border-l-2) {
      border-left-width: 2px !important;
    }
  }
</style>
