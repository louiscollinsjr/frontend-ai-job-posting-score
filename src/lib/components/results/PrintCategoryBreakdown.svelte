<script lang="ts" context="module">
  export interface CategoryMetric {
    key: string;
    label: string;
    score: number;
    max: number;
    percentage: number;
    status: { label: string; badge: string };
    suggestions?: string[];
  }
</script>

<script lang="ts">
  export let metrics: CategoryMetric[] = [];

  function getProgressBarColor(percentage: number): string {
    if (percentage >= 85) return 'bg-gradient-to-r from-green-800 via-green-500 to-green-500';
    if (percentage >= 60) return 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300';
    return 'bg-gradient-to-r from-red-800 via-red-500 to-red-500';
  }

  function getScoreColor(percentage: number): string {
    if (percentage >= 85) return 'text-green-700';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Dot background color to visually match getScoreColor thresholds
  function getDotBgColor(percentage: number): string {
    if (percentage >= 85) return 'bg-green-00';
    if (percentage >= 60) return 'bg-yellow-400';
    return 'bg-red-500';
  }
</script>

<div class="bg-gray-50 py-8 px-8 rounded-2xl">
  <!-- Header -->
  <div class="flex items-baseline mb-4 gap-2">
    <h3 class="text-2xl font-semibold text-gray-900">Category Breakdown</h3>
    <p class="text-sm text-gray-600">Status & Score</p>
  </div>

  <!-- Categories Grid -->
  <div class="grid grid-cols-4 gap-6 gap-y-10 mb-4">
    {#each metrics as metric (metric.key)}
      <div class="rounded-lg">
        <!-- Category Header -->
        <div class="mb-2 flex items-center justify-between ">
          <div class="flex items-center gap-2">
            <span class={`inline-block h-2 w-2 rounded-full ${getDotBgColor(metric.percentage)}`}></span>
            <p class="text-sm font-semibold text-gray-900">{metric.label}:</p>
            <p class="text-sm text-gray-400">{metric.score}/{metric.max}</p>
          </div>
          <!-- <div class={`text-right ${getScoreColor(metric.percentage)}`}>
            <p class="text-sm font-bold">{Math.round(metric.percentage)}%</p>
          </div> -->
        </div>

        <!-- Progress Bar -->
        <div class="mb-0">
          <div class="relative h-1 w-full rounded-full bg-gray-200">
            <div
              class={`absolute inset-y-0 left-0 rounded-full ${getProgressBarColor(metric.percentage)}`}
              style={`width: ${Math.max(metric.percentage, 2)}%;`}
            ></div>
          </div>
        </div>

        <!-- Status Badge -->
        <!-- <div class="flex justify-start">
          <span class={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${metric.status.badge}`}>
            {metric.status.label}
          </span>
        </div> -->

        <!-- Suggestions (if any) -->
        <!-- {#if metric.suggestions && metric.suggestions.length > 0}
          <div class="mt-2 border-t border-gray-100 pt-2">
            <ul class="space-y-1 text-[10px] text-gray-600">
              {#each metric.suggestions.slice(0, 2) as suggestion}
                <li class="flex items-start">
                  <span class="mr-1 text-gray-400">•</span>
                  <span>{suggestion}</span>
                </li>
              {/each}
              {#if metric.suggestions.length > 2}
                <li class="text-gray-400">+ {metric.suggestions.length - 2} more...</li>
              {/if}
            </ul>
          </div>
        {/if} -->
      </div>
    {/each}
  </div>
</div>
