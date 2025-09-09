<!-- src/lib/components/Card_EveryWordMatters.svelte -->
<script>
	import { onMount } from 'svelte';
	import Logo from '$lib/components/Logo.svelte';

	// --- Animation Configuration ---
	const TYPE_SPEED = 25; // Speed of typing in milliseconds per character
	const PAUSE_DURATION = 4000; // How long to wait after typing is complete
	const FADE_DURATION = 300; // Duration of the fade transition between texts

	// --- Data for the animation cycle ---
	const content = [
		{
			title: 'Account Director, Digital Natives',
			body: 'Our Sales team has a unique mission to help customers understand the deep impact that highly capable AI models can bring to their business and users. This role is a mixture of technical understanding, vision, partnership, and value-driven strategy.'
		},
		{
			title: 'You might thrive in this role if you:',
			body: 'Are customer-centric. You are motivated to deeply understand your customer’s priorities and help them achieve their vision for using our models to improve their products and services. You build strong relationships with executives and professionals across functions and serve as a trusted advisor.'
		}
	];

	// --- State Variables ---
	let currentContentIndex = 0;
	let displayedTitle = '';
	let displayedBody = '';
	let isTyping = false;
	let isFading = false;

	// Helper function for delays
	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	// The main animation loop
	async function runAnimationCycle() {
		// Initial setup without fade
		displayedTitle = content[0].title;
		await delay(500);

		// Infinite loop
		while (true) {
			const item = content[currentContentIndex];

			// Start typing the body
			isTyping = true;
			for (let i = 0; i <= item.body.length; i++) {
				displayedBody = item.body.substring(0, i);
				await delay(TYPE_SPEED);
			}
			isTyping = false;

			// Pause so the user can read the full text
			await delay(PAUSE_DURATION);

			// Fade out the text
			isFading = true;
			await delay(FADE_DURATION);

			// Move to the next item in the content array
			currentContentIndex = (currentContentIndex + 1) % content.length;
			const nextItem = content[currentContentIndex];

			// Reset for the next cycle
			displayedBody = '';
			displayedTitle = nextItem.title;

			// Fade in with the new title
			isFading = false;
			await delay(FADE_DURATION + 200); // Wait for fade in plus a small buffer
		}
	}

	onMount(() => {
		runAnimationCycle();
	});
</script>

<div
	class="w-full h-full rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 bg-gradient-to-br from-[#c3cde1] to-[#dde3ee]"
>
	<!-- Mock Browser Window -->
	<div class="flex h-full flex-col overflow-hidden rounded-xl bg-white/60 shadow-inner">
		<!-- Browser Chrome (header) -->
		<div
			class="flex flex-shrink-0 items-center gap-2 border-none border-gray-200 bg-white/30 px-4 py-2.5"
		>
			<div class="h-3 w-3 rounded-full bg-red-400" />
			<div class="h-3 w-3 rounded-full bg-yellow-400" />
			<div class="h-3 w-3 rounded-full bg-green-400" />
		</div>

		<!-- Main Content Area -->
		<div class="flex flex-grow flex-col justify-between bg-white/30 p-5">
			<!-- Animated Input Area -->
			<div
				class="text-content-area flex-grow rounded-lg border border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-700"
				class:faded={isFading}
			>
				{#if displayedTitle}
					<p class="font-semibold text-gray-900 text-xs mb-3">{displayedTitle}</p>
				{/if}
				<p class="text-gray-600 text-xs leading-relaxed">
					{displayedBody}
					<!-- Blinking Cursor only shows while typing -->
					{#if isTyping}
						<span class="cursor" />
					{/if}
				</p>
			</div>

			<!-- Action Button -->
			<div class="mt-4 flex justify-center">
				<div
					class="glow-button flex w-full max-w-[80%] items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm relative overflow-hidden"
				>
					<span>Get</span>
					<Logo variant="white" imgClass="h-3 w-auto sm:h-4" />
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* --- Animation-specific styles --- */
	.text-content-area {
		transition: opacity var(--fade-duration, 300ms) ease-in-out;
		opacity: 1;
	}

	.text-content-area.faded {
		opacity: 0;
	}

	.cursor {
		display: inline-block;
		width: 2px;
		height: 1em;
		background-color: #3b82f6; /* blue-600 */
		margin-left: 2px;
		animation: blink 1s steps(1) infinite;
		transform: translateY(0.2em); /* Better vertical alignment */
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* --- Existing styles (unchanged) --- */
	.glow-button {
		position: relative;
		border: 2px solid transparent;
		background-clip: padding-box;
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.glow-button::before {
		content: '';
		position: absolute;
		top: -3px;
		left: -3px;
		right: -3px;
		bottom: -3px;
		background: linear-gradient(45deg, #c679c4, #fa3d1d, #ffb005, #e1e1fe, #0358f7, #c679c4);
		background-size: 400% 400%;
		z-index: -1;
		border-radius: 9999px;
		animation: glow 4s linear infinite;
		filter: blur(4px);
		opacity: 0.9;
	}

	@keyframes glow {
		0% {
			background-position: 0% 0%;
			filter: blur(4px) brightness(1.2);
		}
		50% {
			background-position: 100% 50%;
			filter: blur(6px) brightness(1.5);
		}
		100% {
			background-position: 0% 0%;
			filter: blur(4px) brightness(1.2);
		}
	}

	.glow-button > * {
		position: relative;
		z-index: 1;
	}
</style>