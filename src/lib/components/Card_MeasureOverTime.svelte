<!-- src/lib/components/Card_MeasureOverTime.svelte -->
<script>
    import Logo from '$lib/components/Logo.svelte';
    import ScorePill from '$lib/components/ScorePill.svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    
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
</script>

<div 
  bind:this={cardElement}
  class="w-auto sm:w-full h-[450px] rounded-2xl sm:p-6 p-2 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 overflow-hidden relative mx-2 sm:mx-0"
  style="{background ? `background-image: url('${background}'); background-position: center; background-size: cover;` : 'background: linear-gradient(to bottom right, #c3cde1, #dde3ee)'}">
    <!-- Mock Browser Window -->
    <div class="flex h-full flex-col overflow-hidden justify-center items-center rounded-xl bg-white/60 shadow-inner p-5">
      <!-- Browser Chrome (header) -->
      <!-- <div class="flex flex-shrink-0 items-center gap-2 border-none border-gray-200 bg-white/30 px-4 py-2.5">
        <div class="h-3 w-3 rounded-full bg-red-400"></div>
        <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
        <div class="h-3 w-3 rounded-full bg-green-400"></div>
      </div> -->
  
      <!-- Main Content Area -->
      
      <div class="flex flex-grow flex-col justify-center items-center bg-white/0"> 
        {#if visible}
          <div in:fly={{ y: 50, duration: 500 }} class="w-full max-w-xs">
            <ScorePill 
              title="JobPostScore" 
              startScore={42} 
              endScore={98} 
              duration={12000}
              isVisible={visible}
            />
          </div>
        {:else}
          <!-- <p class="text-red-500 text-sm">Waiting for card to come into view...</p> -->
        {/if}
      </div>
    </div>
  </div>
  
 