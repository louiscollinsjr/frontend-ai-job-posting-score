<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// --- Props for reusability ---
	/** @type {string} The title to display, e.g., "JobPostScore" */
	export let title = 'JobPostScore';
	/** @type {number} The score to start the animation from */
	export let startScore = 40;
	/** @type {number} The final score to animate to */
	export let endScore = 92;
	/** @type {number} The duration of the animation in milliseconds */
	export let duration = 2000;
	/** @type {boolean} Whether the component is visible and should animate */
	export let isVisible = false;

	// A "tweened" store provides smooth animation between numbers
	const score = tweened(startScore, {
		duration: duration,
		easing: cubicOut
	});
	
	// Initialize the score to startScore
	score.set(startScore, { duration: 0 });

	// Reactive variable to hold the dynamic CSS classes
	let scoreClasses = '';

	// This function determines the color based on the score
	function getScoreColorClasses(value) {
		if (value < 60) {
			return 'bg-red-100/80 text-red-700';
		} else if (value < 80) {
			return 'bg-yellow-100/80 text-yellow-700';
		} else {
			return 'bg-green-100/80 text-green-700';
		}
	}

	// This is a reactive statement. It re-runs whenever the 'score' value changes.
	$: scoreClasses = getScoreColorClasses($score);

	// Start the animation when the component becomes visible
	$: if (isVisible) {
		console.log('ScorePill: isVisible is true, starting animation from', startScore, 'to', endScore);
		// Using a timeout to ensure the animation starts after the initial render
		setTimeout(() => {
			score.set(endScore);
		}, 300);
	} else {
		console.log('ScorePill: isVisible is false');
	}
</script>

<!-- The main component card with a glassy, blurred background effect -->
<div
	class="flex items-center justify-between gap-6 rounded-2xl bg-white/40 p-4 py-12 shadow-lg backdrop-blur-md border border-white/20"
>
	<!-- Title and Icon -->
	<div class="flex items-center gap-3">
		<!-- A simple score/chart icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 text-slate-700"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			/>
		</svg>
		<span class="text-2xl font-semibold text-slate-800">{title}</span>
	</div>

	<!-- The animated score pill -->
	<div
		class="score-pill {scoreClasses} rounded-full px-5 py-2 text-2xl font-bold font-mono transition-colors duration-500"
	>
		<!-- The '$' prefix subscribes to the store, showing the animated value -->
		{$score.toFixed(0)}
	</div>
</div>