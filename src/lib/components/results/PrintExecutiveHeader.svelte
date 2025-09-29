<script lang="ts">
  export let jobTitle: string | null = null;
  export let reportId: string | null = null;
  export let jobUrl: string | null = null;
  export let overallScore: number = 0;
  export let statusLabel: string = '';

  // Get score color based on overall score
  function getScoreColor(score: number): string {
    if (score >= 85) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // amber-500
    if (score >= 40) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  }

  // Get gradient colors for print circle
  function getGradientStops(score: number) {
    if (score >= 85) {
      return ['#22c55e', '#16a34a', '#166534']; // green gradient
    }
    if (score >= 60) {
      return ['#fbbf24', '#eab308', '#ca8a04']; // yellow gradient
    }
    return ['#ef4444', '#dc2626', '#991b1b']; // red gradient
  }

  $: gradientColors = getGradientStops(overallScore);
</script>

<div class="mx-auto mb-12 flex flex-col items-center gap-4 border-b border-gray-200 px-4 py-6 text-center text-gray-900">
  <!-- Logo and Title Section -->
  <div class="mb-8 flex flex-col items-center justify-center gap-2">
    <h1 class="flex items-center gap-2 text-3xl font-semibold">
      <img src="/jobpostscore_logo.svg" alt="JobPostScore" class="h-8 w-auto" />
      <span>Analysis</span>
    </h1>
    <p class="text-sm text-gray-600">Here's how your job posting performed across 7 key metrics</p>
  </div>

  <!-- Score Circle -->
  <div class="relative mb-6 flex flex-col items-center justify-center">
    <div class="relative h-40 w-40">
      <svg class="h-full w-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="printScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={`stop-color:${gradientColors[0]};stop-opacity:1`} />
            <stop offset="50%" style={`stop-color:${gradientColors[1]};stop-opacity:1`} />
            <stop offset="100%" style={`stop-color:${gradientColors[2]};stop-opacity:1`} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" stroke="rgba(0,0,0,.1)" stroke-width="8" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="url(#printScoreGradient)"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray={2 * Math.PI * 42}
          stroke-dashoffset={2 * Math.PI * 42 - (overallScore / 100) * 2 * Math.PI * 42}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-800">
        <span class="text-6xl font-bold text-gray-800">{overallScore}</span>
        <span class="pt-1 text-[10px] text-gray-600">(0-100)</span>
      </div>

       <!-- Score Section -->
    <!-- <div class="my-10 flex items-center justify-center gap-4">
      <div
        class="flex h-40 w-40 flex-col items-center justify-center rounded-full border-[15px] bg-white"
        style={`border-color: ${getScoreColor(overallScore)}`}
      >
        <div class="text-6xl font-bold leading-none text-gray-900">{overallScore}</div>
        <div class="mt-1 text-[8px] text-gray-500">(0-100)</div>
      </div>
    </div> -->
    </div>
  </div>

  <!-- Job Information -->
  {#if jobTitle}
    <div class="space-y-1 text-sms text-gray-600">
      <p class="font-semibold text-gray-700">{jobTitle}</p>
      {#if reportId}
        <p class="text-gray-500">JobPostScore ID: {reportId}</p>
      {/if}
      {#if jobUrl}
        <p class="break-all text-blue-600 underline">{jobUrl}</p>
      {/if}
    </div>
  {/if}
</div>
