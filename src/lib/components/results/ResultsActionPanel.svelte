<script lang="ts">
  import UnlockScorecard from './UnlockScorecard.svelte';

  export let isLoggedIn = false;
  export let hasRewrite = false;
  export let rewriteLoading = false;
  export let loading = false;
  export let onDownloadReport: () => void = () => {};
  export let onDownloadJsonLd: () => void = () => {};
  export let onViewOptimized: () => void = () => {};
  export let onOptimize: () => void = () => {};
  export let onShowSaveDialog: () => void = () => {};
</script>

{#if isLoggedIn}
  <div class="flex flex-wrap justify-center gap-2 rounded-2xl border-none border-gray-200 bg-white px-2 py-8 shadow-none">
    <button
      class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
      on:click={onDownloadReport}
    >
      Download Scorecard
    </button>
    <button
      class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border-none bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
      on:click={onDownloadJsonLd}
    >
      Download JSON-LD Data
    </button>
    {#if hasRewrite}
      <button
        class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border-none bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
        on:click={onViewOptimized}
        disabled={rewriteLoading || loading}
      >
        {rewriteLoading ? 'Opening optimized view…' : 'View Optimized JobPost'}
      </button>
    {:else}
      <button
        class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        on:click={onOptimize}
        disabled={rewriteLoading || loading}
      >
        {rewriteLoading ? 'Optimizing…' : 'Optimize This Posting'}
      </button>
    {/if}
  </div>
{:else}
  <!-- <UnlockScorecard onShowSaveDialog={onShowSaveDialog} onDownloadReport={onDownloadReport} /> -->
{/if}
