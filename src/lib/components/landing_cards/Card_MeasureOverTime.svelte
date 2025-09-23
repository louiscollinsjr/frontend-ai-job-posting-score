<script>
    import Logo from '$lib/components/Logo.svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    
    export let background = '';
    
    let cardElement;
    let visible = false;
    let hasAnimated = false; // Prevent re-triggering
    
    onMount(() => {
        // console.log('Card_MeasureOverTime mounted');
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    console.log('Intersection observer triggered:', entry.isIntersecting, 'visible:', visible, 'hasAnimated:', hasAnimated);
                    if (entry.isIntersecting && !hasAnimated) {
                        console.log('Card came into view - triggering animation');
                        visible = true;
                        hasAnimated = true;
                    } else if (!entry.isIntersecting && hasAnimated) {
                        console.log('Card left view - resetting state');
                        visible = false;
                        hasAnimated = false;
                    }
                });
            },
            { 
                threshold: 0.2, // Trigger when 20% of the element is visible
                rootMargin: '0px'
            }
        );
        
        if (cardElement) {
            observer.observe(cardElement);
            console.log('Started observing card element');
        }
        
        return () => {
            observer.disconnect();
        };
    });
    
    // Circular score indicator config
    const startScore = 0;
    const endScore = 85;
    const duration = 15000;
    
    const strokeWidth = 20;
    // Start angle for the gauge (degrees). 90° = bottom, -90° = top, 0° = right
    const startAngleDeg = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = tweened(0, { duration: 0, easing: cubicOut });
    
    $: currentScore = Math.round(startScore + $progress * (endScore - startScore));
    $: offset = circumference - (currentScore / 100) * circumference;
    
    // Animate when card becomes visible
    $: if (visible) {
        progress.set(1, { duration, easing: cubicOut });
    } else {
        progress.set(0, { duration: 0 });
    }
</script>

<div 
  bind:this={cardElement}
  class="w-auto sm:w-full h-[450px] rounded-2xl sm:p-6 p-2 shadow-[0_0_20px_RGBA(0,0,0,0.05)] border border-gray-200/50 overflow-hidden relative mx-2 sm:mx-0"
  style="{background ? `background-image: url('${background}'); background-position: center; background-size: cover;` : 'background: linear-gradient(to bottom right, #c3cde1, #dde3ee)'}">
    <!-- Mock Browser Window -->
    <div class="flex h-full flex-col overflow-hidden justify-center items-center rounded-xl bg-gray-700/10 shadow-inner p-5">
  
      <!-- Main Content Area -->
      
      <div class="flex flex-grow flex-col justify-center items-center bg-white/0 w-full"> 
        {#if visible}
          <div in:fly={{ y: 30, duration: 400 }} class="flex flex-col items-center mb-12">
            <div class="relative h-56 w-56">
              <svg class="h-full w-full" viewBox="0 0 200 200">
                <!-- Background Track -->
                <circle class="stroke-gray-200" stroke-width="16" fill="transparent" r={radius} cx="100" cy="100" transform={`rotate(${startAngleDeg} 100 100)`} />
                <!-- Foreground Indicator -->
                <circle
                  class="transition-all duration-700 ease-out"
                  class:stroke-green-500={currentScore >= 85}
                  class:stroke-yellow-400={currentScore >= 60 && currentScore < 85}
                  class:stroke-red-500={currentScore > 0 && currentScore < 59}
                  class:stroke-gray-200={currentScore === 0}
                  stroke-width={strokeWidth}
                  stroke-linecap="round"
                  fill="transparent"
                  r={radius}
                  cx="100"
                  cy="100"
                  transform={`rotate(${startAngleDeg} 100 100)`}
                  stroke-dasharray="{circumference} {circumference}"
                  style="stroke-dashoffset: {offset};"
                  opacity="0.9"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-5xl text-bold md:text-5xl font-extrabold shadow-2xl text-white">{currentScore}</span>
              </div>
            </div>
            <div class="mt-8 text-sm text-gray-200 text-center"><Logo variant="white" alt="JobPostScore" imgClass="h-10 w-auto" />Visibility score</div>
          </div>
        {:else}
          <!-- placeholder when not visible -->
        {/if}
      </div>
    </div>
  </div>