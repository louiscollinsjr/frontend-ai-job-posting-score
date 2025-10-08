<script lang="ts">
  import { goto } from '$app/navigation';

  const FALLBACK_BADGE_CLASS = 'bg-gray-100 text-gray-700';

  export let originalScore: number | null = null;
  export let optimizedScore: number | null = null;
  export let badgeClassGetter: (score: number | null) => string = () => FALLBACK_BADGE_CLASS;

  export let heading: string | null = null;
  export let description: string | null = null;
  export let linkHref: string | null = null;
  export let linkLabel: string | null = null;
  export let improvementLabel: string | null = null;
  export let useGoto = true;

  const DEFAULT_HEADING = "You're viewing the original scorecard & analysis.";
  const DEFAULT_DESCRIPTION = 'This keeps the category breakdown aligned with the initial score before optimization.';
  const DEFAULT_LINK_LABEL = 'View optimized report';
  const DEFAULT_IMPROVEMENT_LABEL = 'Improvement';

  const computeBadgeClass = (score: number | null) => {
    try {
      return badgeClassGetter ? badgeClassGetter(score) : FALLBACK_BADGE_CLASS;
    } catch (error) {
      console.error('[OptimizedScoreNotice] badgeClassGetter error', error);
      return FALLBACK_BADGE_CLASS;
    }
  };

  const formatScore = (score: number | null) => (score === null || score === undefined ? '—' : Math.round(score));

  $: hasOriginalScore = originalScore !== null && originalScore !== undefined;
  $: hasOptimizedScore = optimizedScore !== null && optimizedScore !== undefined;
  $: hasScores = hasOriginalScore || hasOptimizedScore;

  $: scoreDelta = hasOriginalScore && hasOptimizedScore
    ? Math.round((optimizedScore ?? 0) - (originalScore ?? 0))
    : null;
  $: improvementText = scoreDelta !== null ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta}` : null;
  $: improvementClasses = scoreDelta === null
    ? ''
    : scoreDelta > 0
      ? 'text-emerald-700 bg-emerald-100'
      : scoreDelta < 0
        ? 'text-rose-700 bg-rose-100'
        : 'text-gray-700 bg-gray-100';

  $: resolvedHeading = heading ?? DEFAULT_HEADING;
  $: resolvedDescription = description ?? DEFAULT_DESCRIPTION;
  $: resolvedLinkLabel = (() => {
    if (typeof linkLabel === 'string' && linkLabel.trim().length > 0) return linkLabel;
    if (linkHref) return DEFAULT_LINK_LABEL;
    return null;
  })();
  $: resolvedImprovementLabel = improvementLabel ?? DEFAULT_IMPROVEMENT_LABEL;

  function handleLinkClick(event: MouseEvent) {
    if (!linkHref) return;
    const isInternal = linkHref.startsWith('/');
    if (useGoto && isInternal) {
      event.preventDefault();
      goto(linkHref);
    }
  }
</script>

{#if hasScores}
  <div class="rounded-xl border border-dashed border-gray-400 bg-gray-100 px-5 py-4 text-sm text-gray-700">
    {#if resolvedHeading}
      <p class="text-sm font-semibold text-gray-900 mb-3">{resolvedHeading}</p>
    {/if}
    {#if resolvedDescription}
      <p class="mt-1 text-sm text-gray-600">{resolvedDescription}</p>
    {/if}

    <div class="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
      {#if hasOriginalScore}
        <span class="text-gray-500">Original score:</span>
        <span class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.8rem] ${computeBadgeClass(originalScore)}`}>
          {formatScore(originalScore)}
        </span>
      {/if}
      {#if hasOptimizedScore}
        <span class="text-gray-500">Optimized score:</span>
        <span class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.8rem] ${computeBadgeClass(optimizedScore)}`}>
          {formatScore(optimizedScore)}
        </span>
      {/if}
      {#if improvementText}
        <span class="text-gray-500 font-bold">{resolvedImprovementLabel}:</span>
        <span class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.8rem] ${improvementClasses}`}>
          {improvementText}
        </span>
      {/if}
    </div>

    {#if linkHref && resolvedLinkLabel}
      <div class="mt-4 text-xs">
        <a
          class="inline-flex items-center gap-1 underline underline-offset-4 text-blue-600 px-3 py-1"
          href={linkHref ?? undefined}
          on:click={handleLinkClick}
        >
          {resolvedLinkLabel}
        </a>
      </div>
    {/if}
  </div>
{/if}
