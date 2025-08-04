<script>
  // Props
  export let score = 0; // Overall score (0-100)
  export let categories = {}; // Categories with scores
  export let categoryLabels = []; // Category metadata
  
  // Function to determine score color based on value
  function getScoreColor(score, max = 100) {
    const pct = score / max;
    if (pct >= 0.85) return 'bg-green-500';
    if (pct >= 0.7) return 'bg-lime-500';
    if (pct >= 0.5) return 'bg-yellow-300';
    if (pct >= 0.3) return 'bg-orange-400';
    return 'bg-red-500';
  }
  
  // Function to determine text color based on score
  function getTextColor(score, max = 100) {
    const pct = score / max;
    if (pct >= 0.85) return 'text-green-600';
    if (pct >= 0.7) return 'text-lime-600';
    if (pct >= 0.5) return 'text-yellow-600';
    if (pct >= 0.3) return 'text-orange-600';
    return 'text-red-600';
  }
  
  // Function to calculate score percentage for bar width
  function getScorePercentage(score, max) {
    return (score / max) * 100;
  }

  // Calculate stroke-dasharray and stroke-dashoffset for circle progress
  $: circumference = 2 * Math.PI * 42; // 42 is the radius of the circle
  $: offset = circumference - (score / 100) * circumference;
</script>

<div class="score-visualizer p-6 pt-32 pb-8 bg-[#f8f8f8] rounded-lg shadow-none">
  <!-- Visibility Score Circle -->
  <div class="mb-6">
    <h1 class="text-3xl text-center mb-2">Your <b class="text-black">JobPostScore</b> Analysis</h1>
    <p class="text-center text-gray-600 mb-12 text-sm">Here's how your job posting performed across key metrics</p>
    
    
    <div class="relative flex justify-center">
      <div class="relative w-48 h-48">
        <!-- SVG Circle Progress -->
        <svg class="w-full h-full" viewBox="0 0 100 100">
          <!-- Background circle -->
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#e5e7eb"
            stroke-width="8"
            fill="none"
          />
          <!-- Progress circle -->
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#000000"
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
          <span class="text-5xl font-bold text-green-black">{Math.round(score)}</span>
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
            <!-- <span class="text-sm {getTextColor(categoryScore, category.max)}">{categoryScore}</span> -->
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              class="h-2.5 rounded-full {getScoreColor(categoryScore, category.max)}"
              style="width: {percentage}%"
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
