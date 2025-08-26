<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { getScoreColorHex100 } from '$lib/utils/colors';

  // Props
  export let value = 100; // target value (0-100)
  export let size = 160; // px
  export let strokeWidth = 10; // px
  export let duration = 1900; // ms
  export let showPercent = true;
  export let backgroundSrc = null; // optional background image
  export let backgroundScale = 1.3; // Scale background larger than progress

  // Geometry based on a 100x100 viewBox
  // Scale stroke width to viewBox dimensions (100x100)
  const scaledStrokeWidth = (strokeWidth / size) * 100;
  const radius = 50 - scaledStrokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated progress value (0-100)
  const progress = tweened(0, { duration, easing: cubicOut });

  // Update animation when props change
  $: progress.set(Math.max(0, Math.min(100, value)), { duration, easing: cubicOut });

  // Derived reactive values
  $: current = $progress;
  $: dashoffset = circumference - (current / 100) * circumference;
  $: colorHex = getScoreColorHex100(current, 100);

</script>

<div class="relative w-full aspect-[4/3] min-h-[220px] overflow-hidden rounded-xl bg-white opacity-80" in:fade={{ duration: 600 }}>
  {#if backgroundSrc}
    <img 
      src={backgroundSrc} 
      alt="Browser background" 
      class="absolute inset-0 w-full h-full object-contain transition-opacity duration-700 opacity-65"
      in:fade={{ delay: 100 }}
    />
  {/if}

  
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="relative w-[70%] h-[70%] flex items-center justify-center">
        <svg class="w-[60%] h-[60%] z-10 relative" viewBox="0 0 100 100" role="img" aria-label="Progress {Math.round(current)} percent" in:fade={{ delay: 300, duration: 800 }}>
          <!-- Track -->
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e5e7eb"
            stroke-width={scaledStrokeWidth}
            fill="none"
          />
          <!-- Progress -->
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colorHex}
            stroke-width={scaledStrokeWidth}
            fill="none"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={dashoffset}
            transform="rotate(-90 50 50)"
            class="transition-[stroke] duration-300 ease-linear"
          />
        </svg>
        {#if showPercent}
        <div class="absolute inset-0 flex flex-col items-center justify-center z-20 w-full h-full">
          <span 
            class="font-bold leading-none"
            style="
              color: {colorHex};
              font-size: min(9vw, 9vh, 4.5rem);
              width: 100%;
              text-align: center;
              white-space: nowrap;
              line-height: 1;
              "
          >
            {Math.round(current)}
          </span>
          <span 
            class="text-xs text-gray-500"
            style="font-size: min(1vw, 2vh, 1.1rem);"
          >
            out of 100
          </span>
        </div>
        {/if}
      </div>
    </div>
  </div>

<style>
  /* No additional styles needed */
</style>
