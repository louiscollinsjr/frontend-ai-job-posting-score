<script lang="ts">
  export let isLoading: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'submit';
  export let disabled: boolean = false;
  export let loadingLabel: string = 'Analyzing...';
  // Allow parent to pass additional classes
  export let className: string = '';
</script>

<button
  type={type}
  class={`relative mx-auto cta-button w-full text-lg sm:text-2xl text-center flex items-center justify-center gap-2 bg-black hover:bg-gray-700 transition-colors duration-300 text-white py-2 px-8 rounded-full font-aeonik tracking-wider font-normal ${className}`}
  disabled={isLoading || disabled}
>
  <span
    aria-hidden="true"
    class="glow pointer-events-none absolute -inset-0.5 -z-10 rounded-full opacity-50"
  ></span>

  {#if isLoading}
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {loadingLabel}
  {:else}
    <slot />
  {/if}
</button>

<style>
  /* Rotating conic-gradient ring */
  @keyframes spinGradient {
    to { transform: rotate(360deg); }
  }
  .glow {
    /* Create a circular/pill ring using mask trick */
    padding: 2px; /* ring thickness */
    border-radius: 9999px;
    background: conic-gradient(
      from 0deg,
      #ff00f7 0%,
      #fa3d1d 33%,
      #0358f7 66%,
      #ff00f7 100%
    ) border-box;
    /* Punch out the center to form a border ring */
    -webkit-mask: 
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    /* Smooth continuous rotation */
    animation: spinGradient 3s linear infinite;
    /* iOS/GPU stability hints */
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }
  @media (prefers-reduced-motion: reduce) {
    .glow {
      animation: none;
    }
  }
</style>
