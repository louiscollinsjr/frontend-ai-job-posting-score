<!-- src/lib/components/Card_KnowExactlyWhereYouStand.svelte -->
<script>
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';

	export let background = '';

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
		{ label: 'Page Context & Cleanliness', score: 68 }
	];

	// Animation state
	let currentIndex = 0;
	const visibleItems = 4; // Number of items to show at once
	const animationDuration = 1000; // ms
	const pauseDuration = 3000; // ms between animations
	let interval;

	// Function to handle auto-scrolling
	function startAutoScroll() {
		interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % (breakdownCategories.length - visibleItems + 1);
		}, pauseDuration + animationDuration);
	}

	// Start and clean up the auto-scroll
	onMount(() => {
		startAutoScroll();
		return () => clearInterval(interval);
	});

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

<div
	class="w-auto sm:w-full h-[450px] rounded-2xl sm:p-6 p-2 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 overflow-hidden relative mx-2 sm:mx-0"
	style={background
		? `background-image: url('${background}'); background-position: center; background-size: cover;`
		: 'background: linear-gradient(to bottom right, #c3cde1, #dde3ee)'}>
	<!-- Inner white container -->
	<div class="flex h-full flex-col overflow-hidden rounded-2xl bg-white/60 p-5 text-center">
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
					cy="60" />
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
					opacity="0.8" />
			</svg>
			<!-- Score Text -->
			<div class="absolute inset-0 flex flex-col items-center justify-center">
				<span class="text-5xl font-bold text-gray-900">{jobScore}</span>
				<!-- <span class="text-sm text-gray-500">(0-100)</span> -->
			</div>
		</div>

		<div class="mt-2">
			<h3 class="text-lg font-semibold text-gray-900">JobPostScore</h3>
			<p class="text-sm text-gray-500">Job Post Visibility & Quality Index</p>
		</div>

		<!-- Divider -->
		<hr class="my-3 opacity-55" />

		<!-- Breakdown Section -->
		<div class="flex-grow text-left overflow-hidden">
			<h4 class="sm:hidden mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
				Breakdown by Category
			</h4>
			<div class="relative h-[200px] overflow-hidden">
				<div
					class="space-y-3 transition-transform duration-1000 ease-in-out"
					style="transform: translateY(-${currentIndex * (100 / visibleItems)}%);">
					{#each breakdownCategories as category, i}
						<div
							in:fade={{ duration: 300, delay: 100 }}
							out:fade={{ duration: 300 }}
							class="h-[calc(25%-1rem)]">
							<p class="mb-1.5 text-sm font-medium text-gray-700">{category.label}</p>
							<div class="relative h-2 w-full rounded-full bg-gray-200">
								<div
									class="absolute h-full rounded-full {getBarColor(
										category.score
									)} transition-all duration-700 ease-out"
									style="width: {category.score}%;">
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
