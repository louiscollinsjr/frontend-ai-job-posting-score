<script>
  export let currentScore = 0;
  export let optimizedScore = 0;
  export let improvement = 0;
  
  $: improvementText = improvement > 0 ? `+${improvement} Points` : `${improvement} Points`;
  $: improvementColor = improvement > 0 ? 'text-green-600' : 'text-gray-600';
</script>

<div class="flex items-center gap-6">
  <!-- Current Score -->
  <div class="text-center">
    <div class="text-sm text-gray-600 font-medium">Current Score</div>
    <div class="text-2xl font-bold text-yellow-500">{currentScore}</div>
  </div>
  
  <!-- Arrow -->
  <div class="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  </div>
  
  <!-- Optimized Score -->
  <div class="text-center">
    <div class="text-sm text-gray-600 font-medium">Optimized Score</div>
    <div class="text-2xl font-bold text-green-500">{optimizedScore}</div>
  </div>
  
  <!-- Improvement Badge -->
  {#if improvement !== 0}
    <div class="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <div class="text-xs text-green-700 font-medium">Improvement</div>
      <div class="text-sm font-bold {improvementColor}">{improvementText}</div>
    </div>
  {/if}
</div>
