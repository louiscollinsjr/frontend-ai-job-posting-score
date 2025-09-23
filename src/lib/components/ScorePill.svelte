<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import Logo from '$lib/components/Logo.svelte'; 

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
			return 'bg-yellow-300/60 text-yellow-700';
		} else {
			return 'bg-green-100/80 text-green-500';
		}
	}

	// This is a reactive statement. It re-runs whenever the 'score' value changes.
	$: scoreClasses = getScoreColorClasses($score);

	let hasStartedAnimation = false;
	
	// Start the animation when the component becomes visible
	$: if (isVisible && !hasStartedAnimation) {
		console.log('ScorePill: Starting animation from', startScore, 'to', endScore);
		hasStartedAnimation = true;
		
		// Reset to start score first (instantly)
		score.set(startScore, { duration: 0 });
		
		// Then animate to end score with a small delay
		setTimeout(() => {
			console.log('ScorePill: Now animating to', endScore, 'over', duration, 'ms');
			score.set(endScore, { duration: duration });
		}, 500); // Delay to let the fly animation finish
	} else if (!isVisible) {
		console.log('ScorePill: Not visible, resetting to start score');
		hasStartedAnimation = false;
		score.set(startScore, { duration: 0 });
	}
</script>

<!-- The main component card with a glassy, blurred background effect -->
<div
	class="flex flex-col items-center justify-between gap-6 rounded-2xl  p-4 py-12"
>
	<!-- Title and Icon -->
	<div class="flex items-center gap-6">
		<!-- A simple score/chart icon -->
		<span class="text-2xl font-semibold text-slate-800"><Logo variant="black" imgClass="h-10 w-auto" /></span>
	</div>

	<!-- The animated score pill -->
	<div
		class="score-pill {scoreClasses} rounded-full px-8 py-3 text-8xl font-bold font-mono transition-colors duration-500 mt-10"
	>
		<!-- The '$' prefix subscribes to the store, showing the animated value -->
		{$score.toFixed(0)}
	</div>
</div>