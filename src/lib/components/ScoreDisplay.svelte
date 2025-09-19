<script>
  export let currentScore = 0;
  export let optimizedScore = 0;
  export let improvement = 0;
  
  $: improvementText = improvement > 0 ? `+${improvement} Points` : `${improvement} Points`;
  $: improvementColor = improvement > 0 ? 'text-green-600' : 'text-gray-600';
</script>
 
<div class="flex items-center justify-between w-full gap-2">
  <!-- Current Score -->
  <div class="flex-1 min-w-0 text-center border-1 border-gray-200 rounded-lg px-3 py-2 bg-gray-200">
    <div class="text-xs text-gray-600 font-medium">Original Score</div>
    <div class="text-sm font-bold text-black truncate">{currentScore}</div>
  </div>
  
  <!-- Arrow -->
  <!-- <div class="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  </div> -->
  
  <!-- Optimized Score -->
  <div class="flex-1 min-w-0 text-center border-1 border-gray-200 rounded-lg px-3 py-2 bg-gray-200">
    <div class="text-xs text-gray-600 font-medium">Optimized Score</div>
    <div class="text-sm font-bold text-black truncate">{optimizedScore}</div>
  </div>
  
  <!-- Improvement Badge -->
  {#if improvement !== 0}
    <div class="flex-1 min-w-0 border-1 border-gray-200 rounded-lg px-3 py-2 bg-gray-200 text-center">
      <div class="text-xs text-black font-medium">Improvement</div>
      <div class="text-sm font-bold {improvementColor} truncate">{improvementText}</div>
    </div>
  {/if}
</div>
