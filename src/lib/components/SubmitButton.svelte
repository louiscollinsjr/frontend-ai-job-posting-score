<script lang="ts">
  export let isLoading: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'submit';
  export let disabled: boolean = false;
  export let loadingLabel: string = 'Analyzing...';
  export let className: string = '';
  export let onClick: (() => void) | undefined = undefined;
  export let glow: boolean = true;
  export let currentStep: string = '';
  export let showSteps: boolean = false;

  // Base classes for the button, includes 'relative' for the glow effect
  const baseClass = 'relative mx-auto cta-button w-full text-lg sm:text-2xl text-center flex items-center justify-center gap-2 bg-black hover:bg-gray-700 transition-colors duration-300 text-white py-2 px-8 rounded-lg font-aeonik tracking-wider font-normal mt-12';

  // If className is provided, use it completely. Otherwise, use baseClass.
  $: finalClass = className || baseClass;
  
  // Display text based on current step
  $: displayText = showSteps && currentStep ? currentStep : loadingLabel;
</script>

<button
  type={type}
  class={finalClass}
  disabled={isLoading || disabled}
  on:click={onClick}
>
  {#if glow}
    <span
      aria-hidden="true"
      class="glow pointer-events-none absolute -inset-0.5 -z-10 rounded-lg"
    ></span>
  {/if}

  <span class="relative z-10 flex flex-col items-center justify-center w-full">
    {#if isLoading}
      <div class="flex items-center justify-center gap-3">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-base sm:text-lg">{displayText}</span>
      </div>
      {#if showSteps && currentStep}
        <span class="text-xs sm:text-sm text-white/70 mt-2 animate-pulse">This usually takes 40-70 seconds...</span>
      {/if}
    {:else}
      <span class="flex items-center justify-center gap-2">
        <slot />
      </span>
    {/if}
  </span>
</button>

<style>
  /* Subtle color shift animation */
  @keyframes colorShift {
    0% { background-position: 0% 0%; }
    100% { background-position: 100% 100%; }
  }
  .glow {
    
    background: linear-gradient(
      to left,
      #fa3d1d 0%,
      #ffb005 25%,
      #0358f7 50%,
      #c679c4 100%
    );
    background-size: 150% 150%;
    filter: blur(1px);
    /* Smooth color transition */
    animation: colorShift 3s infinite ease-in-out alternate;
  }
  @media (prefers-reduced-motion: reduce) {
    .glow {
      animation: none;
    }
  }
</style>
