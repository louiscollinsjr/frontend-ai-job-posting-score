<script lang="ts">
  interface CategoryMetric {
    key: string;
    label: string;
    score: number;
    max: number;
    percentage: number;
    status: { label: string; badge: string };
    suggestions?: string[];
  }

  export let metrics: CategoryMetric[] = [];

  function gradientClass(percentage: number) {
    if (percentage >= 85) return 'bg-gradient-to-r from-green-800 via-green-500 to-green-500';
    if (percentage >= 60) return 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300';
    return 'bg-gradient-to-r from-red-800 via-red-500 to-red-500';
  }
</script>

<section class="space-y-6">
  <!-- Recommended Improvements -->
	<div class="bg-white rounded-lg border-2 border-black shadow-sm py-3">
		<div class="px-6 pb-4 flex items-center justify-between border-b">
			<div class="">
				<h3 class="text-lg font-semibold text-gray-900 flex items-center">
					Category Breakdown
				</h3>
				<p class="text-sm text-gray-600 mt-1">Score & Status</p>
			</div>
		</div>

		<div class="p-6 pb-6">
			<div class="space-y-3">
        {#each metrics as metric (metric.key)}
          <article class="rounded-2xl border-none border-gray-200 bg-white/70 px-4 py-1 shadow-none">
            <header class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{metric.label}</p>
               
              </div>
              <!-- <span class={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${metric.status.badge}`}>
                {metric.status.label}
              </span> -->
            </header>
            <div class="mt-3">
              <div class="relative h-2 w-full rounded-full bg-gray-200">
                <div
                  class={`absolute inset-y-0 left-0 rounded-full ${gradientClass(metric.percentage)}`}
                  style={`width: ${Math.max(metric.percentage, 2)}%;`}
                ></div>
              </div>
             
            </div>
          </article>
        {/each}
      </div>
		</div>
	</div>

</section>
