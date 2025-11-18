<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import Logo from '$lib/components/Logo.svelte';
  import SaveReportDialog from '$lib/components/SaveReportDialog.svelte';
  import ExecutiveHeaderCard from '$lib/components/results/ExecutiveHeaderCard.svelte';
  import TopImprovementsPanel from '$lib/components/results/TopImprovementsPanel.svelte';
  import CategoryBreakdownPanel from '$lib/components/results/CategoryBreakdownPanel.svelte';
  import OptimizedScoreNotice from '$lib/components/results/OptimizedScoreNotice.svelte';
  import ResultsActionPanel from '$lib/components/results/ResultsActionPanel.svelte';
  import UnlockScorecard from '$lib/components/results/UnlockScorecard.svelte';
  import GuestPrintLayout from '$lib/components/results/GuestPrintLayout.svelte';
  import UserPrintLayout from '$lib/components/results/UserPrintLayout.svelte';

  const dispatch = createEventDispatcher();
  // Safe defaults to avoid runtime ReferenceErrors when props not provided by parent
  export let printPageSize: 'a4' | 'letter' = 'letter';
  export let loading = false;
  export let isLoggedIn = false;
  export let results: any = null;
  export let categoryLabels: Array<{key: string; label: string; max: number}> = [];
  export let rewriteLoading = false;

  const circleRadius = 42;

  function getScoreBadgeClasses(score: number | null): string {
    const val = clampPercentage(score ?? 0);
    if (val >= 85) return 'bg-emerald-100 text-emerald-900 ';
    if (val >= 60) return 'bg-amber-100 text-amber-500 ';
    if (val >= 45) return 'bg-red-100 text-red-700 ';
    return 'bg-rose-100 text-rose-900 ';
  }

  function clampPercentage(value: number): number {
    if (Number.isNaN(value) || value === null || value === undefined) return 0;
    return Math.min(Math.max(value, 0), 100);
  }

  function getCategoryStatusDetails(percentage: number): { label: string; badge: string } {
    if (percentage >= 85) {
      return { label: 'Leading', badge: 'bg-green-100 text-green-700' };
    }
    if (percentage >= 60) {
      return { label: 'On track', badge: 'bg-yellow-100 text-yellow-700' };
    }
    if (percentage >= 45) {
      return { label: 'Needs focus', badge: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'Critical', badge: 'bg-red-100 text-red-700' };
  }

  function getStatusToneClass(percentage: number): string {
    if (percentage >= 85) return 'print:text-emerald-700 text-emerald-700';
    if (percentage >= 60) return 'print:text-amber-700 text-amber-700';
    if (percentage >= 45) return 'print:text-orange-700 text-orange-700';
    return 'print:text-rose-700 text-rose-700';
  }

  function formatScoreDelta(delta: number | null): string {
    if (delta === null || delta === undefined) return '';
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return '±0';
  }

  const MAX_PRIORITY_ITEMS = 10;

  export let downloadReport = () => {};
  
  // SaveReportDialog state
  let showSaveDialog = false;
  
  // Handle save report dialog submission

  function handleSaveReportSubmit(event: { detail: { email: string; report: any } }): void {
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
  const toSnakeCase = (str: string): string => str.replace(/[A-Z]/g, (m: string) => '_' + m.toLowerCase());

  // Normalize a category object to always have an array suggestions field
  function normalizeCategory(val: any): any {
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
    const out: Record<string, any> = {};
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

  $: scoreValue = processedResults?.overallScore ?? 0;
  $: overallScore = Math.round(clampPercentage(scoreValue));
  $: circumference = 2 * Math.PI * circleRadius;
  $: scoreOffset = circumference - (clampPercentage(scoreValue) / 100) * circumference;
  $: overallStatus = getCategoryStatusDetails(overallScore);
  $: optimizedScore = (() => {
    if (!results) return null;
    const optimization = results?.optimizationData ?? {};
    const value = optimization?.optimized_score ?? optimization?.optimizedScore ?? results?.optimizedScore;
    if (value === null || value === undefined) return null;
    return Math.round(clampPercentage(value));
  })();
  $: hasOptimizedView = Boolean(results?.hasRewrite && optimizedScore !== null);

  $: categoryMetrics = effectiveCategoryLabels.map((cat) => {
    const data = (resolvedCategories as Record<string, any>)?.[cat.key];
    const rawScore = data?.score ?? 0;
    const safeMax = cat.max || 100;
    const percentage = clampPercentage((rawScore / safeMax) * 100);
    return {
      ...cat,
      data,
      score: rawScore,
      percentage,
      status: getCategoryStatusDetails(percentage),
      suggestions: data?.suggestions ?? []
    };
  });

  $: improvementGroups = effectiveCategoryLabels
    .map((cat) => {
      const suggestions = (resolvedCategories as Record<string, any>)?.[cat.key]?.suggestions ?? [];
      const score = (resolvedCategories as Record<string, any>)?.[cat.key]?.score ?? 0;
      const max = cat.max || 100;
      const percentage = clampPercentage((score / max) * 100);
      return {
        key: cat.key,
        label: cat.label,
        suggestions,
        score,
        max,
        percentage,
        status: getCategoryStatusDetails(percentage)
      };
    })
    .filter((group) => group.suggestions.length > 0);

  $: hasImprovementContent = improvementGroups.length > 0 || generalRecommendations.length > 0;

  $: prioritizedImprovementItems = improvementGroups
    .flatMap((group) =>
      group.suggestions.map((text: string, index: number) => ({
        category: group.label,
        text,
        ratio: group.max ? group.score / group.max : 0,
        index
      }))
    )
    .sort((a, b) => {
      if (a.ratio === b.ratio) return a.index - b.index;
      return a.ratio - b.ratio;
    });

  $: generalImprovementItems = generalRecommendations.map((text: string, index: number) => ({
    category: 'General',
    text,
    ratio: 1,
    index
  }));

  $: scoreDelta = hasOptimizedView && optimizedScore !== null ? optimizedScore - overallScore : null;

  $: printPriorityItems = (() => {
    const prioritized = prioritizedImprovementItems
      .filter((item) => item?.text?.trim?.())
      .slice(0, MAX_PRIORITY_ITEMS);

    if (prioritized.length >= 3 || prioritized.length === MAX_PRIORITY_ITEMS) {
      return prioritized;
    }

    const needed = MAX_PRIORITY_ITEMS - prioritized.length;
    const fallback = generalImprovementItems
      .filter((item) => item?.text?.trim?.())
      .slice(0, needed);

    return [...prioritized, ...fallback];
  })();

  const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };

  $: formattedGeneratedDate = (() => {
    const source =
      processedResults?.created_at ||
      processedResults?.createdAt ||
      processedResults?.updated_at ||
      processedResults?.updatedAt ||
      null;

    if (source) {
      const parsed = new Date(source);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
      }
    }

    return new Date().toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  })();

  $: formattedPrintedDate = new Date().toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);

</script>

<div class="results-page pb-32 bg-[#f8f8f8]/0 print:bg-white print:pb-0">
  <!-- Wide container for navigation (screen only) -->
  <!-- {#if isLoggedIn}
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
  {/if} -->

  <!-- Main content container -->
  <div id="print-root" class="max-w-7xl mx-auto pb-8 px-4 print:mx-auto print:bg-white print:shadow-none print:px-0 print:pb-0" class:print-a4={printPageSize === 'a4'} class:print-letter={printPageSize === 'letter'} class:guest-print-root={!isLoggedIn}>
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
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-lg text-gray-600">Analyzing your job posting...</p>
        </div>
      {:else if processedResults}
        <div class="space-y-10">
          <section class="bg-white/0 rounded-3xl border-none border-gray-200 shadow-none shadow-gray-200/40 overflow-hidden">
            <ExecutiveHeaderCard
              jobTitle={processedResults.job_title}
              reportId={processedResults.id}
              jobUrl={processedResults.job_url}
              overallScore={overallScore}
              scoreOffset={scoreOffset}
              circumference={circumference}
              statusLabel={overallStatus.label}
            />

            <div class="px-2 py-10 ">
              {#if isLoggedIn}
                <div class="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div class="space-y-6">
                    {#if hasOptimizedView}
                      <OptimizedScoreNotice
                        reportId={results?.id || ''}
                        originalScore={overallScore}
                        optimizedScore={optimizedScore || 0}
                        badgeClassGetter={getScoreBadgeClasses}
                        heading="You're viewing the original scorecard and analysis."
                        description="This keeps the category breakdown aligned with the initial score before optimization."
                        improvementLabel="Change"
                        linkHref={`/results?report=${results?.id || ''}&view=optimized`}
                        linkLabel="View optimized report"
                      />
                    {/if}
                    <CategoryBreakdownPanel metrics={categoryMetrics} />
                    <ResultsActionPanel
                      isLoggedIn={isLoggedIn}
                      hasRewrite={results?.hasRewrite || false}
                      rewriteLoading={rewriteLoading}
                      loading={loading}
                      onDownloadReport={downloadReport}
                      onDownloadJsonLd={() => goto(`/json-ld?report=${results?.id || ''}`)}
                      onViewOptimized={() => goto(`/results?report=${results?.id || ''}&view=optimized`)}
                      onOptimize={() => dispatch('optimize')}
                      onShowSaveDialog={() => (showSaveDialog = true)}
                    />
                  </div>
                  <div class="space-y-6">
                    <TopImprovementsPanel groups={improvementGroups} generalRecommendations={generalRecommendations} />
                  </div>
                </div>
              {:else}
                <div class="flex justify-center">
                  <UnlockScorecard
                    onShowSaveDialog={() => (showSaveDialog = true)}
                    onDownloadReport={downloadReport}
                  />
                </div>
              {/if}
            </div>
          </section>

          <!-- Action panel moved into right column above improvements -->

        </div>
      {/if}
    </div>
    
    <!-- Print Layout -->
    <div class="hidden print:block" id="print-content">
      {#if processedResults}
        {#if isLoggedIn}
          <UserPrintLayout
            {processedResults}
            {overallScore}
            {overallStatus}
            {hasOptimizedView}
            {categoryMetrics}
            {improvementGroups}
            {generalRecommendations}
            {formattedPrintedDate}
          />
    {:else}
      <GuestPrintLayout
        {processedResults}
        {overallScore}
        {formattedPrintedDate}
        onShowSaveDialog={() => (showSaveDialog = true)}
        onDownloadReport={downloadReport}
      />
    {/if}
  {:else}
    <div class="no-data">
      <Logo variant="black" alt="JobPostScore" imgClass="logo-large" />
      <p>No data available for printing.</p>
    </div>
  {/if}
</div>
    
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

  /* Specific page settings for guest users to ensure single page */
  @page :first {
    margin: 6mm;
  }
</style>
