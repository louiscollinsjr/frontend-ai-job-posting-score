<script lang="ts">
  export let onShowSaveDialog: () => void = () => {};
  export let onDownloadReport: () => void = () => {};

  type CategoryTeaser = {
    name: string;
    score: number;
  };

  const CATEGORY_TEASERS: CategoryTeaser[] = [
    { name: 'Structured Data', score: 15 },
    { name: 'Compensation', score: 100 },
    { name: 'Clarity', score: 72 },
    { name: 'Prompt Alignment', score: 64 },
    { name: 'Keyword Targeting', score: 48 },
    { name: 'Recency', score: 55 },
    { name: 'Page Context', score: 38 }
  ];

  function getPillClasses(score: number): string {
    if (score >= 85) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (score >= 60) return 'border-amber-200 bg-amber-50 text-amber-700';
    if (score >= 45) return 'border-red-200 bg-red-50 text-red-700';
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
</script>

<section class="flex w-full max-w-3xl flex-col items-center gap-6 self-center rounded-2xl border border-dashed border-gray-300 bg-gray-100 px-6 py-8 text-center gap-y-6">
  
  <div>
    <span class="inline-flex items-center gap-2 rounded-full bg-gray-900/5 px-3 py-1 text-[8pt] font-semibold uppercase tracking-wide text-gray-700 mb-3">
      <img src="/unlock.svg" alt="Unlock icon" class="h-3 w-3" />
      Unlock your complete scorecard
    </span>
    <p class="text-3xl font-semibold text-gray-900">Turn insights into action</p>
    <p class="mt-2 max-w-lg text-base text-gray-600">Save this audit, compare against other roles, and receive guided optimization suggestions.</p>
  </div>
  <!-- <div class="flex flex-wrap justify-center gap-2 max-w-xl">
    {#each CATEGORY_TEASERS as category (category.name)}
      <span class={`rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-wide ${getPillClasses(category.score)}`}>
        {category.name}
      </span>
    {/each}
  </div> -->
  <div class="flex max-w-xs flex-col items-center justify-center gap-3">
    <button
      class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800"
      on:click={onShowSaveDialog}
    >
      Save & Improve This Report
    </button>
    <button
      class="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
      on:click={onDownloadReport}
    >
      Print This Scorecard
    </button>
  </div>
  <p class="text-[11px] text-gray-500">Free account • No credit card required • Export ready</p>
</section>
