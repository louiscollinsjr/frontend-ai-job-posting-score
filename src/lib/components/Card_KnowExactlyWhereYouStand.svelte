<!-- src/lib/components/Card_KnowExactlyWhereYouStand.svelte -->
<script>
    // --- Component Data ---
    // This data would typically be passed in as props.
    const jobScore = 85;
  
    const breakdownCategories = [
      { label: 'Clarity & Readability', score: 85 },
      { label: 'Prompt Alignment', score: 82 },
      { label: 'Structured Data Presence', score: 5 },
      { label: 'Recency & Freshness', score: 35 },
      { label: 'Keyword Targeting', score: 95 },
      { label: 'Compensation Transparency', score: 0 },
      { label: 'Page Context & Cleanliness', score: 68 },
    ];
  
    // --- UI Logic ---
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (jobScore / 100) * circumference;
  
    // Helper function to determine progress bar color based on score
    function getBarColor(score) {
      if (score >= 80) return 'bg-green-500'; // Excellent
      if (score >= 60) return 'bg-yellow-400'; // Good
      if (score >= 30) return 'bg-orange-400'; // Needs Improvement
      if (score > 0) return 'bg-red-500'; // Poor
      return 'bg-gray-200'; // None
    }
  </script>
  
  <div class="w-full h-full rounded-2xl bg-gray-50/50 p-4 sm:p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 bg-gradient-to-br from-[#c3cde1] to-[#dde3ee">
    <!-- Inner white container -->
    <div class="flex h-full flex-col overflow-hidden rounded-xl bg-white p-5 text-center">
      
      <!-- Score Gauge -->
      <div class="relative mx-auto h-36 w-36">
        <svg class="h-full w-full" viewBox="0 0 120 120" transform="rotate(-90)">
          <!-- Background Track -->
          <circle
            class="stroke-gray-200"
            stroke-width="12"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <!-- Foreground Score Indicator -->
          <circle
            class="transition-all duration-1000 ease-out"
            class:stroke-green-500={jobScore >= 80}
            class:stroke-yellow-400={jobScore >= 60 && jobScore < 80}
            class:stroke-orange-400={jobScore >= 30 && jobScore < 60}
            class:stroke-red-500={jobScore > 0 && jobScore < 30}
            class:stroke-gray-200={jobScore === 0}
            stroke-width="12"
            stroke-linecap="round"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            stroke-dasharray="{circumference} {circumference}"
            style="stroke-dashoffset: {offset};"
          />
        </svg>
        <!-- Score Text -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-4xl font-bold text-gray-900">{jobScore}</span>
          <span class="text-sm text-gray-500">(0-100)</span>
        </div>
      </div>
  
      <div class="mt-2">
        <h3 class="text-lg font-semibold text-gray-900">JobPostScore</h3>
        <p class="text-sm text-gray-500">Job Post Visibility & Quality Index</p>
      </div>
  
      <!-- Divider -->
      <hr class="my-6" />
  
      <!-- Breakdown Section -->
      <div class="flex-grow text-left">
        <h4 class="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
          Breakdown by Category
        </h4>
        <div class="space-y-4">
          {#each breakdownCategories as category}
            <div>
              <p class="mb-1.5 text-sm font-medium text-gray-700">{category.label}</p>
              <div class="relative h-2 w-full rounded-full bg-gray-200">
                <div
                  class="absolute h-full rounded-full {getBarColor(category.score)} transition-all duration-700 ease-out"
                  style="width: {category.score}%;"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>