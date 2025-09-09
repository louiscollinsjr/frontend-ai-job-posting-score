<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// --- Configuration ---
	const TYPE_SPEED = 60; // Milliseconds per character
	const QUERY_PAUSE = 2500; // Milliseconds to pause after a query is complete
	const FADE_DURATION = 300; // Milliseconds for fade out/in effect

	// --- Data for the animation sequence ---
	// Using simple paths for icons. Replace with your actual asset paths.
	const queries = [
		{
			parts: [
				{ type: 'text', content: 'Convince me not to buy this ' },
				{
					type: 'pill',
					name: 'Vintage Fendi Baguette',
					source: 'TheRealReal',
					icon: 'https://cdn.worldvectorlogo.com/logos/the-realreal.svg' // Example icon
				}
			]
		},
		{
			parts: [
				{ type: 'text', content: 'Make this ' },
				{
					type: 'pill',
					name: 'June Newsletter',
					source: 'Substack',
					icon: 'https://cdn.worldvectorlogo.com/logos/substack-1.svg' // Example icon
				},
				{ type: 'text', content: ' sound on-brand ' },
				{
					type: 'pill',
					name: 'Brand Voice',
					source: 'Notion',
					icon: 'https://cdn.worldvectorlogo.com/logos/notion-1.svg' // Example icon
				}
			]
		},
		{
			parts: [
				{ type: 'text', content: "Explain this to me like I'm five " },
				{
					type: 'pill',
					name: 'Singularities...',
					source: 'Quanta Magazine',
					icon: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgMTJDMiAxNC4wMiAxNC4wMiAyIDEyIDJDMTEuOTcgMiAxMi4yNiA1LjU4IDEyIDUuNUMxMS43NCA1LjU4IDguMDIgMiA2IDJDMy45OCAyIDIgMy45OCAyIDZDMiA4LjAyIDUuNTggMTEuNzQgNS41OCAxMkM1LjU4IDEyLjI2IDIgMTEuOTcgMiAxMlpNNiAyMkM4LjAyIDIyIDExLjc0IDE4LjQyIDEyIDE4LjQyQzEyLjI2IDE4LjQyIDEyIDE0LjM2IDEyIDE0LjM2QzEyIDE0LjM2IDguMDIgMjIgNiAyMlpNMTIgNS41QzE0LjM2IDUuNSA4LjM0IDExLjc0IDguMzQgMTJDOC4zNCAxMi4yNiAxNC4zNiAxMi4yNiAxNC4zNiAxMlpNMTggMjJDMTkuNjQgMjIgMTkuNjQgOS4wMiAxOCAzLjVDMTYuMzYgOS4wMiAxNi4zNiAyMiAxOCAyMlpNMTIgMTguNUMxNC4zNiAxOC41IDIwLjY2IDEyLjI2IDIwLjY2IDEyQzIwLjY2IDExLjc0IDE0LjM2IDExLjc0IDE0LjM2IDExLjc0QzE0LjM2IDExLjc0IDExLjczIDE4LjUgMTIgMTguNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=` // Placeholder SVG for Quanta
				}
			]
		},
		{
			parts: [
				{ type: 'text', content: 'Compare ' },
				{
					type: 'pill',
					name: 'Tuscan Villa',
					source: 'Airbnb',
					icon: 'https://cdn.worldvectorlogo.com/logos/airbnb.svg' // Example icon
				},
				{ type: 'text', content: ', ' },
				{
					type: 'pill',
					name: 'Il Casone',
					source: 'Airbnb',
					icon: 'https://cdn.worldvectorlogo.com/logos/airbnb.svg' // Example icon
				},
				{ type: 'text', content: ' in a table with price, beds, proximity to best coffee' }
			]
		}
	];

	let currentQueryIndex = 0;
	let displayedParts = [];
	let currentTypingText = '';
	let isTyping = false;
	let isVisible = true;

	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	async function typeText(text) {
		isTyping = true;
		for (let i = 0; i < text.length; i++) {
			currentTypingText = text.substring(0, i + 1);
			await delay(TYPE_SPEED);
		}
		// Once typing is done, commit the text to the displayedParts array
		if (currentTypingText) {
			displayedParts = [...displayedParts, { type: 'text', content: currentTypingText }];
			currentTypingText = '';
		}
		isTyping = false;
	}

	async function runAnimationCycle() {
		while (true) {
			const query = queries[currentQueryIndex];
			
			// Show and build the current query
			isVisible = true;
			await delay(FADE_DURATION);

			for (const part of query.parts) {
				if (part.type === 'text') {
					await typeText(part.content);
				} else if (part.type === 'pill') {
					displayedParts = [...displayedParts, part];
					await delay(200); // Small pause after a pill appears
				}
			}

			// Pause before clearing
			await delay(QUERY_PAUSE);
			
			// Hide and reset for the next query
			isVisible = false;
			await delay(FADE_DURATION); // Wait for fade out animation
			displayedParts = [];
			currentTypingText = '';

			// Move to the next query
			currentQueryIndex = (currentQueryIndex + 1) % queries.length;
		}
	}

	onMount(() => {
		runAnimationCycle();
	});
</script>

<div class="search-bar-container">
	<div class="search-bar" class:visible={isVisible}>
		<!-- Magnifying Glass Icon -->
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="icon">
			<path
				d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
				stroke="#6b7280"
				stroke-width="1.66667"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>

		<!-- Animated Content Area -->
		<div class="content-wrapper">
			{#each displayedParts as part, i (i)}
				{#if part.type === 'text'}
					<span>{part.content}</span>
				{:else if part.type === 'pill'}
					<div
						class="pill"
						transition:fly={{ x: 20, duration: 400, opacity: 0, easing: quintOut }}
					>
						<img src={part.icon} alt="{part.source} logo" class="pill-icon" />
						<span class="pill-name">{part.name}</span>
					</div>
				{/if}
			{/each}

			<!-- Currently typing text with cursor -->
			<span class="typing-text">
				{currentTypingText}
				{#if isTyping}
					<span class="cursor" />
				{/if}
			</span>
		</div>

		<!-- Upload Button Icon -->
		<div class="upload-button">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="icon">
				<path
					d="M10 17.5V7.5M10 7.5L6.25 11.25M10 7.5L13.75 11.25M5 2.5H15"
					stroke="white"
					stroke-width="1.66667"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	</div>
</div>

<style>
	.search-bar-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 4rem 2rem;
		background-color: #f8f9fa;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		max-width: 700px;
		min-height: 56px;
		padding: 8px 12px;
		background-color: white;
		border-radius: 28px;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		border: 1px solid #e5e7eb;
		opacity: 0;
		transition: opacity var(--fade-duration, 300ms) ease;
	}
	
	.search-bar.visible {
		opacity: 1;
	}

	.icon {
		flex-shrink: 0;
	}

	.content-wrapper {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		color: #111827;
		font-size: 16px;
		line-height: 24px;
		min-height: 24px;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background-color: #f3f4f6;
		padding: 4px 8px;
		border-radius: 6px;
		white-space: nowrap;
	}

	.pill-icon {
		width: 16px;
		height: 16px;
		object-fit: contain;
	}

	.pill-name {
		font-size: 15px;
		font-weight: 500;
	}

	.typing-text {
		display: inline-block;
		position: relative;
	}

	.cursor {
		display: inline-block;
		width: 1.5px;
		height: 18px;
		background-color: #2563eb;
		margin-left: 1px;
		position: relative;
		top: 4px;
		animation: blink 1s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	.upload-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background-color: #111827;
		border-radius: 50%;
		flex-shrink: 0;
		margin-left: auto;
	}
</style>