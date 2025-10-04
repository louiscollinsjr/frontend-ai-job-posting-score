<script lang="ts" context="module">
	export interface ImprovementGroup {
		key: string;
		label: string;
		score: number;
		max: number;
		status: { label: string; badge: string };
		suggestions: string[];
	}
</script>

<script lang="ts">
	export let groups: ImprovementGroup[] = [];
	export let generalRecommendations: string[] = [];
</script>

<section class="space-y-6">
	<!-- Recommended Improvements -->
	<div class="bg-white rounded-lg border-2 border-black shadow-sm py-3">
		<div class="px-6 pb-4 flex items-center justify-between border-b">
			<div class="">
				<h3 class="text-lg font-semibold text-gray-900 flex items-center">
					Suggested Improvements
				</h3>
				<p class="text-sm text-gray-600 mt-1">Prioritized by opportunity</p>
			</div>
		</div>

		<div class="p-6 pb-0">
			{#if groups.length || generalRecommendations.length}
				<div class="space-y-4 max-h-[460px] overflow-y-scroll pr-2 custom-scrollbar">
					{#each groups as group (group.key)}
						<div class="space-y-2">
							<div>
								<p class="text-sm font-semibold text-gray-900">{group.label}</p>
							</div>
							<ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 leading-snug">
								{#each group.suggestions as suggestion}
									<li>{suggestion}</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
					<h3 class="text-base font-semibold text-gray-800">No improvements required</h3>
					<p class="mt-2 text-sm text-gray-500">
						Great work! This posting is performing well across our primary visibility signals.
					</p>
				</div>
			{/if}
		</div>
	</div>

  <div class="bg-white rounded-lg border-2 border-black shadow-sm py-3 mt-10">
		<div class="px-6 pb-4 flex items-center justify-between border-b">
			<div class="">
				<h3 class="text-lg font-semibold text-gray-900 flex items-center">
					General Recommendations
				</h3>
				<p class="text-sm text-gray-600 mt-1">Applies across your entire posting</p>
			</div>
		</div>

		<div class="p-6 pb-0">
			{#if groups.length || generalRecommendations.length}
				<div class="space-y-4 max-h-[460px] overflow-y-scroll pr-2 custom-scrollbar">
					
					{#if generalRecommendations.length}
						<div class="space-y-3">
							<ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 leading-snug">
								{#each generalRecommendations as recommendation}
									<li>{recommendation}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{:else}
				<div
					class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
					<h3 class="text-base font-semibold text-gray-800">No improvements required</h3>
					<p class="mt-2 text-sm text-gray-500">
						Great work! This posting is performing well across our primary visibility signals.
					</p>
				</div>
			{/if}
		</div>
	</div>
</section>
