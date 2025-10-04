<script lang="ts">
  // Props
  export let score = 0; // Overall score (0-100)
  export let categories: Record<string, any> = {}; // Categories with scores
  export let categoryLabels: Array<{key: string; label: string; max: number}> = []; // Category metadata
  import Logo from '$lib/components/Logo.svelte';
  import { getScoreColorHex100, getScoreBarClass100, getTextColorClass100 } from '$lib/utils/colors';
  
  // Use shared class helpers for consistency
  
  // Using shared hex color mapping for consistency across components
  
  // Function to calculate score percentage for bar width (clamped between 0-100%)
  function getScorePercentage(score: number, max: number): number {
    const percentage = (score / max) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
  }

  // Function to get gradient class based on percentage - matches SVG gradient colors
  function getGradientClass(percentage: number): string {
    if (percentage >= 75) {
      return 'bg-gradient-to-r from-green-800 via-green-600 to-green-500';
    } else if (percentage >= 50) {
      return 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400';
    } else {
      return 'bg-gradient-to-r from-red-800 via-red-500 to-red-400';
    }
  }

  // Calculate stroke-dasharray and stroke-dashoffset for circle progress
  $: circumference = 2 * Math.PI * 42; // 42 is the radius of the circle
  $: offset = circumference - (score / 100) * circumference;
</script>

<div class="score-visualizer p-6 pt-32 pb-8 bg-transparent rounded-lg shadow-none">
  <!-- Visibility Score Circle -->
  <div class="mb-6">
    <h1 class="text-3xl mb-2 whitespace-nowrap flex items-center justify-center gap-2 leading-none">
      <Logo variant="black" alt="JobPostScore" imgClass="h-7 sm:h-10 w-auto align-middle" />
      <span class="align-middle">Analysis</span>
    </h1>
    <p class="text-center text-gray-600 mb-12 text-sm">Here's how your job posting performed across key metrics</p>
    
    
    <div class="relative flex justify-center">
      <div class="relative w-48 h-48">
        <!-- SVG Circle Progress -->
        <svg class="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <!-- Dynamic gradient that matches category breakdown style (lighter to darker) -->
            <linearGradient id="dynamicScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              {#if score >= 85}
                <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#16a34a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#166534;stop-opacity:1" />
              {:else if score >= 60}
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
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#e5e7eb"
            stroke-width="8"
            fill="none"
          />
          <!-- Progress circle with beautiful gradient -->
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#dynamicScoreGradient)"
            stroke-width="8"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={offset}
            transform="rotate(-90 50 50)"
            class="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        <!-- Score value -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-5xl font-bold text-black">{Math.round(score)}</span>
          <span class="text-xs text-gray-500">(0-100)</span>
        </div>
        
      </div>
    </div>
    <h3 class="text-lg font-bold mt-12 mb-2 text-center">JobPostScore</h3>
    <p class="text-sm text-gray-600 text-center mb-20">Job Post Visibility & Quality Index</p>
  </div>
  
  <!-- Category Breakdown -->
  <div>
    <h3 class="text-lg font-medium uppercase mb-8">Breakdown by Category</h3>
    
    <div class="space-y-6">
      {#each categoryLabels as category}
        {@const categoryScore = categories[category.key]?.score || 0}
        {@const percentage = getScorePercentage(categoryScore, category.max)}
        
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-base font-medium">{category.label}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              class="h-2.5 rounded-full {getGradientClass(percentage)} transition-all duration-500 ease-out"
              style="width: {percentage}%; max-width: 100%;"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  /* Optional: Add any additional styling here */
  :global(.score-visualizer) {
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
