<!-- src/lib/components/Card_BeFound.svelte -->
<script>
    import Logo from '$lib/components/Logo.svelte';
    import LayeredCard from '$lib/components/LayeredCard.svelte';
    import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let background = '';

	// --- Props for reusability ---
	export let userPrompt =
		'Find me a remote Senior Frontend role at a mission-driven company with a strong focus on work-life balance.';
	export let aiResponseTitle = 'Senior Frontend Engineer (React) - Remote';
	export let aiResponseBody =
		"At FinFlow, we're on a mission to make personal finance accessible... Our fully remote culture and focus on sustainable productivity make us a top choice for talent.";

	// --- Animation State ---
	let showPrompt = false;
	let isTyping = false;
	let typedText = '';
	let showResponse = false;
	let showThinking = false;

	const TYPE_SPEED = 40;

	const delay = (ms) => new Promise((res) => setTimeout(res, ms));

	async function runAnimation() {
		// Reset for looping if needed in future
		showPrompt = false;
		isTyping = false;
		typedText = '';
		showResponse = false;
		showThinking = false;
		await delay(500);

		// 1. Show the prompt container and start typing
		showPrompt = true;
		await delay(300); // Wait for container transition
		isTyping = true;
		for (let i = 0; i <= userPrompt.length; i++) {
			typedText = userPrompt.substring(0, i);
			await delay(TYPE_SPEED);
		}
		isTyping = false;
		await delay(300);

		// 2. Show a "thinking" state
		showThinking = true;
		await delay(1200); // Simulate AI processing

		// 3. Hide "thinking" and show the final response
		showThinking = false;
		showResponse = true;
	}

	onMount(() => {
		runAnimation();
	});
</script>

<style>
  @keyframes pulse-border {
    0%, 100% {
      border-color: rgba(209, 213, 219, 0.3);
      box-shadow: 0 0 0 0 rgba(1, 158, 223, 0.2);
    }
    50% {
      border-color: rgba(1, 158, 223, 0.5);
      box-shadow: 0 0 0 2px rgba(1, 158, 223, 0.1);
    }
  }
  
  .animate-pulse-border {
    animation: pulse-border 3s ease-in-out infinite;
  }

  .cursor {
		display: inline-block;
		width: 2px;
		height: 1em;
		background-color: #3b82f6; /* blue-500 */
		margin-left: 2px;
		animation: blink 1s steps(1) infinite;
		transform: translateY(0.15em);
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	.dot {
		width: 6px;
		height: 6px;
		background-color: #9ca3af; /* gray-400 */
		border-radius: 50%;
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.animate-delay-150 {
		animation-delay: 0.15s;
	}
	.animate-delay-300 {
		animation-delay: 0.3s;
	}

	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}
</style>

<div 
  class="w-full h-full rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 overflow-hidden relative"
  style="{background ? `background-image: url('${background}'); background-position: center; background-size: cover;` : 'background: linear-gradient(to bottom right, #c3cde1, #dde3ee)'}">
    <!-- Mock Browser Window -->
    <div class="flex h-full flex-col overflow-hidden rounded-xl bg-white/10">
      <!-- Main Content Area -->
      <div class="flex flex-col gap-4 h-full p-6 bg-white/60 rounded-lg border border-gray-200/80">
        <!-- User Prompt Section -->
        {#if showPrompt}
            <div
                class="user-prompt bg-gray-100 p-4 rounded-lg self-end max-w-[85%]"
                transition:fly={{ y: 20, duration: 400, opacity: 0, easing: quintOut }}
            >
                <p class="text-sm text-gray-800">
                    {typedText}
                    {#if isTyping}
                        <span class="cursor" />
                    {/if}
                </p>
            </div>
        {/if}
    
        <!-- AI "Thinking" Indicator -->
        {#if showThinking}
            <div class="self-start" transition:fly={{ y: 10, duration: 300, opacity: 0 }}>
                <div class="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-full">
                    <span class="dot" />
                    <span class="dot animate-delay-150" />
                    <span class="dot animate-delay-300" />
                </div>
            </div>
        {/if}
    
        <!-- AI Response Section -->
        {#if showResponse}
            <div
                class="ai-response self-start w-full"
                transition:fly={{ y: 20, duration: 400, opacity: 0, easing: quintOut }}
            >
                <div class="border border-gray-200 rounded-lg p-4 bg-white">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-bold bg-[#00c951] text-white px-4 py-2 rounded-2xl">
                          <Logo variant="white" imgClass="h-3 w-auto sm:h-3" />
                        </span>
                    </div>
                    <h4 class="font-semibold text-gray-900">{aiResponseTitle}</h4>
                    <p class="mt-1 text-xs text-gray-600 truncate">{aiResponseBody}</p>
                </div>
            </div>
        {/if}
    </div>
    </div>
  </div>
  
 