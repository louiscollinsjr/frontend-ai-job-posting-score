<script>
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
  export let printPageSize = 'letter'; // 'a4' | 'letter'
  export let loading = false;
  export let isLoggedIn = false;
  export let results = null;
  export let categoryLabels = [];
  export let rewriteLoading = false;

  const showPrintPreview = import.meta.env.DEV;

  const circleRadius = 42;

  function getScoreBadgeClasses(score) {
    const val = clampPercentage(score ?? 0);
    if (val >= 85) return 'bg-emerald-100 text-emerald-900 ';
    if (val >= 60) return 'bg-amber-100 text-amber-500 ';
    if (val >= 45) return 'bg-red-100 text-red-700 ';
    return 'bg-rose-100 text-rose-900 ';
  }

  function clampPercentage(value) {
    if (Number.isNaN(value) || value === null || value === undefined) return 0;
    return Math.min(Math.max(value, 0), 100);
  }

  function getCategoryStatusDetails(percentage) {
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

  function getStatusToneClass(percentage) {
    if (percentage >= 85) return 'print:text-emerald-700 text-emerald-700';
    if (percentage >= 60) return 'print:text-amber-700 text-amber-700';
    if (percentage >= 45) return 'print:text-orange-700 text-orange-700';
    return 'print:text-rose-700 text-rose-700';
  }

  function formatScoreDelta(delta) {
    if (delta === null || delta === undefined) return '';
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return '±0';
  }

  const MAX_PRIORITY_ITEMS = 5;

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
    const data = resolvedCategories?.[cat.key];
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
      const suggestions = resolvedCategories?.[cat.key]?.suggestions ?? [];
      const score = resolvedCategories?.[cat.key]?.score ?? 0;
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
      group.suggestions.map((text, index) => ({
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

  $: generalImprovementItems = generalRecommendations.map((text, index) => ({
    category: 'General',
    text,
    ratio: 1,
    index
  }));

  $: scoreDelta = hasOptimizedView ? optimizedScore - overallScore : null;

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

  const DATE_FORMAT_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

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

            <div class="px-2 py-10">
              {#if isLoggedIn}
                <div class="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div class="space-y-6">
                    {#if hasOptimizedView}
                      <OptimizedScoreNotice
                        reportId={results.id}
                        originalScore={overallScore}
                        optimizedScore={optimizedScore}
                        badgeClassGetter={getScoreBadgeClasses}
                        heading="You're viewing the original scorecard and analysis."
                        description="This keeps the category breakdown aligned with the initial score before optimization."
                        improvementLabel="Change"
                        linkHref={`/results?report=${results.id}&view=optimized`}
                        linkLabel="View optimized report"
                      />
                    {/if}
                    <CategoryBreakdownPanel metrics={categoryMetrics} />
                    <ResultsActionPanel
                      isLoggedIn={isLoggedIn}
                      hasRewrite={results?.hasRewrite}
                      rewriteLoading={rewriteLoading}
                      loading={loading}
                      onDownloadReport={downloadReport}
                      onDownloadJsonLd={() => goto(`/json-ld?report=${results.id}`)}
                      onViewOptimized={() => goto(`/results?report=${results.id}&view=optimized`)}
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
    <div class="print:block" class:hidden={!showPrintPreview} id="print-content">
      {#if processedResults}
        {#if isLoggedIn}
          <UserPrintLayout
            {processedResults}
            {overallScore}
        {scoreOffset}
        {circumference}
        {overallStatus}
        {hasOptimizedView}
        {optimizedScore}
        {results}
        {getScoreBadgeClasses}
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

  @media print {
    /* Force everything to fit on one page for guests */
    .compact-guest-print {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-before: avoid !important;
      page-break-after: avoid !important;
    }
  }

  @media print {
    /* Ensure colors are preserved when printing and force light mode */
    :global(html), :global(body) {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #ffffff !important;
      color: #1a1a1a !important;
      margin: 0 !important;
      padding: 0 !important;
      font-size: 10pt !important;
      line-height: 1.3 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
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
      padding: 12mm !important;
      overflow: visible;
    }

    /* Guest-specific print root sizing */
    :global(.guest-print-root) {
      padding: 8mm !important;
    }

    :global(#print-content) {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      display: block !important;
    }

    :global(#screen-content) {
      display: none !important;
    }

    /* Print Layout Styles */
    .print-header {
      margin-bottom: 16pt !important;
    }

    .print-content {
      margin-bottom: 16pt !important;
    }

    /* Authenticated User Print Layout */
    .print-authenticated-layout {
      width: 100% !important;
    }

    .print-main-content {
      display: flex !important;
      flex-direction: column !important;
      gap: 16pt !important;
    }

    .print-optimized-notice {
      margin-bottom: 12pt !important;
    }

    .print-category-breakdown {
      margin-bottom: 12pt !important;
    }

    .print-improvements {
      margin-bottom: 12pt !important;
    }

    /* Row 1: Title Section */
    .title-section {
      margin-bottom: 16pt !important;
    }

    .logo-title {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6pt !important;
      margin-bottom: 4pt !important;
    }

    .subtitle {
      font-size: 7pt !important;
      color: #6b7280 !important;
      margin: 0 !important;
      font-style: italic !important;
    }

    :global(.compact-logo) {
      height: 18pt !important;
      width: auto !important;
    }

    .analysis-title {
      font-size: 16pt !important;
      font-weight: 600 !important;
      color: #1a1a1a !important;
    }

    /* Row 2: Score Section */
    .score-section {
      text-align: center !important;
      margin-bottom: 12pt !important;
    }

    .score-display {
      display: inline-flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      width: 70pt !important;
      height: 70pt !important;
      border: 3pt solid #ef4444 !important;
      border-radius: 50% !important;
      background: #ffffff !important;
    }

    .score-number {
      font-size: 18pt !important;
      font-weight: 700 !important;
      color: #1a1a1a !important;
      line-height: 1 !important;
    }

    .score-label {
      font-size: 6pt !important;
      color: #6b7280 !important;
      margin-top: 1pt !important;
    }

    /* Row 3: Job Info */
    .job-info {
      text-align: center !important;
      margin-bottom: 8pt !important;
    }

    .job-title {
      font-size: 9pt !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin: 0 0 4pt 0 !important;
    }

    .report-details {
      font-size: 7pt !important;
      color: #6b7280 !important;
      margin: 0 !important;
      line-height: 1.3 !important;
    }

    .report-id {
      color: #6b7280 !important;
    }

    .job-url {
      color: #3b82f6 !important;
      text-decoration: underline !important;
      font-size: 6pt !important;
    }

  

    .unlock-badge {
      display: inline-block !important;
      background: #1f2937 !important;
      color: #ffffff !important;
      font-size: 6pt !important;
      font-weight: 600 !important;
      padding: 3pt 8pt !important;
      border-radius: 12pt !important;
      margin-bottom: 8pt !important;
      letter-spacing: 0.5pt !important;
    }

    .cta-title {
      font-size: 18pt !important;
      font-weight: 600 !important;
      color: #1a1a1a !important;
      margin: 8pt 0 6pt 0 !important;
    }

    .cta-description {
      font-size: 9pt !important;
      color: #6b7280 !important;
      margin: 0 0 16pt 0 !important;
      line-height: 1.4 !important;
    }

    .cta-buttons {
      display: flex !important;
      flex-direction: column !important;
      gap: 8pt !important;
      margin-bottom: 12pt !important;
    }

    .primary-button {
      background: #1f2937 !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 20pt !important;
      padding: 8pt 20pt !important;
      font-size: 9pt !important;
      font-weight: 600 !important;
      cursor: pointer !important;
    }

    .secondary-button {
      background: #ffffff !important;
      color: #374151 !important;
      border: 1pt solid #d1d5db !important;
      border-radius: 20pt !important;
      padding: 8pt 20pt !important;
      font-size: 9pt !important;
      font-weight: 600 !important;
      cursor: pointer !important;
    }

    .cta-note {
      font-size: 7pt !important;
      color: #9ca3af !important;
      margin: 0 !important;
    }

    /* Print Footer */
    .print-footer {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding-top: 8pt !important;
      border-top: 1pt solid #e5e7eb !important;
      font-size: 7pt !important;
      color: #6b7280 !important;
      margin-top: 12pt !important;
    }

    /* Compact footer for guest users */
    .compact-footer {
      margin-top: 16pt !important;
      padding-top: 6pt !important;
      font-size: 6pt !important;
    }

    .print-footer .footer-left,
    .print-footer .footer-right {
      margin: 0 !important;
    }

    .print-footer p {
      margin: 0 !important;
    }

    /* No Data State */
    .no-data {
      text-align: center !important;
      padding: 40pt 0 !important;
    }

    :global(.logo-large) {
      height: 32pt !important;
      margin-bottom: 8pt !important;
    }

    .no-data p {
      font-size: 9pt !important;
      color: #6b7280 !important;
    }

    /* Ensure components print properly */
    :global(.print\:block) {
      display: block !important;
    }

    :global(.print\:hidden) {
      display: none !important;
    }

    /* Override any screen-only styles for print */
    :global(.max-w-3xl) {
      max-width: 100% !important;
    }

    :global(.rounded-2xl),
    :global(.rounded-3xl) {
      border-radius: 8pt !important;
    }

    :global(.border-dashed) {
      border-style: solid !important;
    }

    :global(.bg-gray-50),
    :global(.bg-gray-100) {
      background-color: #f9fafb !important;
    }

    /* Ensure text sizes are appropriate for print */
    :global(.text-3xl) {
      font-size: 16pt !important;
    }

    :global(.text-4xl) {
      font-size: 18pt !important;
    }

    :global(.text-xl) {
      font-size: 12pt !important;
    }

    :global(.text-base) {
      font-size: 10pt !important;
    }

    :global(.text-sm) {
      font-size: 9pt !important;
    }

    :global(.text-xs) {
      font-size: 8pt !important;
    }

  }
</style>
