<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { MilestoneEvent } from '$lib/stores/milestones';

	export let milestones: MilestoneEvent[] = [];

	// Derive latest milestone for display
	$: latestMilestone = milestones.length > 0 ? milestones[milestones.length - 1] : null;
	$: isComplete = latestMilestone?.status === 'complete';
	$: hasError = latestMilestone?.status === 'error';

	// Format elapsed time
	function formatElapsed(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		return seconds > 0 ? `${seconds}s` : '<1s';
	}

	// Get status color
	function getStatusColor(status: string): string {
		switch (status) {
			case 'complete':
				return 'text-green-600';
			case 'error':
				return 'text-red-600';
			case 'started':
			default:
				return 'text-blue-600';
		}
	}
</script>

{#if latestMilestone}
	<div
		class="milestone-progress bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
		in:fly={{ y: -10, duration: 300, easing: cubicOut }}
		out:fade={{ duration: 200 }}>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				{#if !isComplete && !hasError}
					<div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
				{:else if isComplete}
					<svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				{:else if hasError}
					<svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12" />
					</svg>
				{/if}
				<div>
					<p class="text-sm font-medium {getStatusColor(latestMilestone.status)}">
						{latestMilestone.step}
					</p>
					{#if latestMilestone.note}
						<p class="text-xs text-gray-500 mt-0.5">{latestMilestone.note}</p>
					{/if}
				</div>
			</div>
			<div class="text-xs text-gray-400">
				{formatElapsed(latestMilestone.elapsed)}
			</div>
		</div>

		{#if latestMilestone.score !== undefined && latestMilestone.maxScore}
			<div class="mt-3">
				<div class="flex items-center justify-between text-xs text-gray-600 mb-1">
					<span>Score</span>
					<span>{latestMilestone.score}/{latestMilestone.maxScore}</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-1.5">
					<div
						class="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
						style="width: {(latestMilestone.score / latestMilestone.maxScore) * 100}%"></div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.milestone-progress {
		font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}
</style>
