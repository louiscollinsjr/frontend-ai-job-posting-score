<script lang="ts">
  import Logo from '$lib/components/Logo.svelte';

  export let jobTitle: string | null = null;
  export let reportId: string | null = null;
  export let jobUrl: string | null = null;
  export let overallScore: number = 0;
  export let scoreOffset: number = 0;
  export let circumference: number = 2 * Math.PI * 42;
  export let statusLabel: string = '';
</script>

<header class="bg-gray-950/0 text-gray-900 py-4 px-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-gray-950/5">
  <div>
    <h1 class="text-3xl font-semibold mt-6 flex items-center gap-2">
      <Logo variant="black" alt="JobPostScore" imgClass="h-9 w-auto" />
      <span>Scorecard</span>
    </h1>
    {#if jobTitle}
      <div class="mt-6 space-y-1 text-sm text-gray-600">
        <p class="font-medium text-gray-600">{jobTitle}</p>
        {#if reportId}
          <p>JobPostScore ID: {reportId}</p>
        {/if}
        {#if jobUrl}
          <a
            href={jobUrl}
            class="underline underline-offset-4 text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            {jobUrl}
          </a>
        {/if}
      </div>
    {/if}
  </div>

  <div class="relative flex flex-col items-center justify-center bg-gray-950/0 mb-0 ">
    <div class="relative w-44 h-44">
      <svg class="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="summaryScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {#if overallScore >= 85}
              <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#16a34a;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#166534;stop-opacity:1" />
            {:else if overallScore >= 60}
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
        <circle cx="50" cy="50" r="42" stroke="rgba(0,0,0,.1)" stroke-width="10" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="url(#summaryScoreGradient)"
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray={circumference}
          stroke-dashoffset={scoreOffset}
          transform="rotate(-90 50 50)"
          class="transition-all duration-1000 ease-in-out drop-shadow-[0_4px_12px_rgba(22,163,74,0.35)]"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-800">
        <span class="text-5xl font-bold text-gray-800">{overallScore}</span>
        <span class="text-xs  tracking-[0.28em] text-gray-800 pt-2">(0-100)</span>
      </div>
    </div>
    <!-- <p class="mt-4 text-xs tracking-wide uppercase text-gray-400">{statusLabel}</p> -->
  </div>
</header>
