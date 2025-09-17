<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let sliderPosition = 50; // Initial position at 50%
	let isDragging = false;
	let container; // This will be bound to the main container div

	// Reactive styles that update whenever sliderPosition changes
	$: handleStyle = `left: ${sliderPosition}%;`;
	$: beforeImageStyle = `clip-path: inset(0 ${100 - sliderPosition}% 0 0);`;

	const handleMove = (e) => {
		if (!isDragging || !container) return;

		// Get the bounding box of the container
		const rect = container.getBoundingClientRect();
		// Determine clientX from either mouse or touch event
		const clientX = e.clientX ?? e.touches[0].clientX;
		// Calculate the new position as a percentage
		let newPosition = ((clientX - rect.left) / rect.width) * 100;

		// Clamp the value between 0 and 100
		sliderPosition = Math.max(0, Math.min(100, newPosition));
	};

	const startDragging = () => {
		isDragging = true;
	};

	const stopDragging = () => {
		isDragging = false;
	};

	// Add global listeners when component mounts to handle dragging outside the component
	onMount(() => {
		if (browser) {  
			window.addEventListener('mousemove', handleMove);
			window.addEventListener('touchmove', handleMove);
			window.addEventListener('mouseup', stopDragging);
			window.addEventListener('touchend', stopDragging);
		}
	});

	// Clean up global listeners when component is destroyed
	onDestroy(() => {
		if (browser) {  
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('touchmove', handleMove);
			window.removeEventListener('mouseup', stopDragging);
			window.removeEventListener('touchend', stopDragging);
		}
	});
</script>

<!-- The main container establishes the relative positioning context -->
<div bind:this={container} class="relative w-full aspect-video select-none overflow-hiddenx rounded-xl shadow-none border-0 border-gray-200">
	<!-- The "After" image/content is the base layer -->
	<div class="absolute inset-0">
		<slot name="after" />
	</div>

	<!-- The "Before" image/content is on top and gets clipped -->
	<div class="absolute inset-0" style={beforeImageStyle}>
		<slot name="before" />
	</div>

	<!-- The draggable slider handle and line -->
	<div class="absolute inset-y-0 z-10 w-0.5 bg-black/50 cursor-ew-resize" style={handleStyle}>
		<div
			class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 bg-black/100 rounded-full shadow-none backdrop-blur-sm flex items-center justify-center"
			on:mousedown={startDragging}
			on:touchstart={startDragging}
		>
			<!-- Arrows Icon -->
			<svg class="w-4 h-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 7l4-4m0 0l4 4m-4-4v18m0 0l-4-4m4 4l4-4"
					transform="rotate(90 12 12)"
				/>
			</svg>
		</div>
	</div>
</div>

<style>
	/* Ensures slotted content fills the container */
	:global(.image-slider-content) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none; /* Prevents image dragging issues */
	}
</style>