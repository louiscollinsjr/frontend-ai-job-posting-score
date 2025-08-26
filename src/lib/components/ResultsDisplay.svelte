<script>
  import ScoreVisualizer from '$lib/components/ScoreVisualizer.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { getScoreColorHex100 as utilGetScoreColorHex100, getTextColorClass100 as utilGetTextColorClass100 } from '$lib/utils/colors';
  // Safe defaults to avoid runtime ReferenceErrors when props not provided by parent
  export let printPageSize = 'a4'; // 'a4' | 'letter'
  export let loading = false;
  export let isLoggedIn = false;
  export let results = null;
  export let categoryLabels = [];
  export let rewriteLoading = false;

  // Map incoming results to the expected internal structure
  let processedResults = null;
  $: processedResults = results
    ? {
        ...results,
        // Prefer existing overallScore, else map from common DB fields
        overallScore: results?.overallScore ?? results?.total_score ?? results?.totalScore ?? 0,
        // Ensure categories is an object
        categories: results?.categories ?? {},
      }
    : null;

  // Default labels and max values if parent doesn't pass any
  const DEFAULT_CATEGORY_LABELS = [
    { key: 'clarity', label: 'Clarity', max: 20 },
    { key: 'promptAlignment', label: 'Prompt Alignment', max: 20 },
    { key: 'structuredData', label: 'Structured Data', max: 15 },
    { key: 'recency', label: 'Recency', max: 10 },
    { key: 'keywordTargeting', label: 'Keyword Targeting', max: 15 },
    { key: 'compensation', label: 'Compensation', max: 10 },
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

  // No-op handlers to avoid ReferenceErrors if parent doesn't pass them
  export let handleRewrite = () => {};
  export let downloadReport = () => {};
  export let downloadJobData = () => {};

  // Fallback color helpers if not injected by parent
  // Delegate to shared utility class helper for consistency
  export let getScoreColor100 = (score) => utilGetTextColorClass100(score, 100);
  // Delegate to shared utility by default; parent may still override via prop
  export let getScoreColorHex100 = (score) => utilGetScoreColorHex100(score, 100);
</script>

<div class="results-page pb-32 bg-[#f8f8f8]/0 print:bg-white print:pb-0">
  <div id="print-root" class="max-w-2xl mx-auto pb-8 px-4 print:mx-auto print:bg-white print:shadow-none print:text-[12px] print:leading-tight print:px-0 print:pb-0" class:print-a4={printPageSize === 'a4'} class:print-letter={printPageSize === 'letter'}>
    <div id="print-content">
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
            <Button variant="default" size="sm" on:click={downloadReport}>Download Report</Button>

            <Button variant="default" size="sm" id="downloadButton" on:click={downloadJobData}>
              Download JSON-LD Data
            </Button>

            <!-- if enterprise account-->
            <Button
              variant="default"
              size="sm"
              on:click={handleRewrite}
              disabled={rewriteLoading || loading}
            >
              {rewriteLoading ? 'Improving...' : 'Improve This Posting'}
            </Button>
          </div>
        {:else}
          <!-- Always show the score prominently with progress circle -->
          <div class="text-center mb-8 avoid-break print:mb-4">
            <h1
              class="text-3xl mb-2 whitespace-nowrap flex items-center justify-center gap-2 leading-none"
            >
              <Logo variant="black" alt="JobPostScore" imgClass="h-7 sm:h-10 w-auto align-middle" />
              <span class="align-middle">Analysis</span>
            </h1>
            <p class="text-center text-gray-600 mb-12 text-xs">
              Here's how your job posting performed across key metrics
            </p>
            <div class="relative flex justify-center">
              <div class="relative w-64 h-64 print:w-48 print:h-48">
                <!-- SVG Circle Progress -->
                <svg
                  class={`w-full h-full ${getScoreColor100(
                    processedResults?.overallScore || 0,
                    100
                  )}`}
                  viewBox="0 0 100 100"
                >
                  <!-- Background circle -->
                  <circle cx="50" cy="50" r="42" stroke="#e5e7eb" stroke-width="8" fill="none" />
                  <!-- Progress circle -->
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={getScoreColorHex100(processedResults?.overallScore || 0, 100)}
                    stroke-width="8"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray={2 * Math.PI * 42}
                    stroke-dashoffset={2 * Math.PI * 42 -
                      ((processedResults?.overallScore || 0) / 100) * 2 * Math.PI * 42}
                    transform="rotate(-90 50 50)"
                    class="transition-all duration-1000 ease-in-out"
                  />
                </svg>

                <!-- Score value -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl sm:text-7xl font-bold text-black print:text-5xl"
                    >{Math.round(processedResults?.overallScore || 0)}</span
                  >
                  <span class="text-xs text-gray-500">(0-100)</span>
                </div>
              </div>
            </div>
          </div>

          <div> <!-- Wrapper for guest content -->
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
              </div>
            {/if}

            <div class="bg-gray-50 border border-black border-b-2 border-r-2 rounded-lg p-8 py-20 mt-24 mb-16 text-center avoid-break print:hidden">
              <!-- Magic link gate content -->
            </div>
          </div> <!-- Close guest wrapper div -->
        {/if}
      {/if}
    </div> <!-- End #print-content -->
  </div> <!-- End #print-root -->
</div> <!-- End .results-page -->

{#if !loading && !processedResults}
  <!-- Fallback content -->
{/if}

<style>
  /* Component-scoped utilities for printing */
  :global(.avoid-break) {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  @page {
    size: A4;
    margin: 12mm;
  }

  @media print {
    /* Ensure colors are preserved when printing and force light mode */
    :global(html), :global(body) {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #ffffff !important;
      color: #000 !important;
    }

    :global(.results-page),
    :global(.results-page-container) {
      background: #ffffff !important;
    }

    /* Constrain printable width per selected paper size */
    :global(#print-root.print-a4) {
      width: 186mm; /* 210mm - 24mm total margins */
    }
    :global(#print-root.print-letter) {
      width: 7.5in; /* 8.5in - 1in total margins */
    }
    :global(#print-root) {
      margin: 0 auto;
      /* Allow content to flow and break naturally on pages */
      overflow: visible;
    }

    :global(#print-content) {
      transform-origin: top center;
      width: 100%;
      /* Allow natural page breaks within content */
    }

    :global(.results-page) {
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Optional utility if you want to force a new page before a section */
    :global(.print-break-before) {
      break-before: page;
      page-break-before: always;
    }
  }
</style>
