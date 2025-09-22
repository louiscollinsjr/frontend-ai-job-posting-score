<!-- src/lib/components/Card_MeasureOverTime.svelte -->
<script>
    import Logo from '$lib/components/Logo.svelte';
    import ScorePill from '$lib/components/ScorePill.svelte';
    import { onMount } from 'svelte';
    
    export let background = '';
    
    let cardElement;
    let isVisible = false;
    
    onMount(() => {
        console.log('Card_MeasureOverTime mounted');
        
        // Add a small delay to ensure the element is properly mounted
        setTimeout(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        console.log('Intersection observer triggered:', entry.isIntersecting, 'isVisible:', isVisible);
                        if (entry.isIntersecting && !isVisible) {
                            console.log('Setting isVisible to true');
                            isVisible = true;
                            // Disconnect observer after first trigger to prevent re-triggering
                            observer.disconnect();
                        }
                    });
                },
                { 
                    threshold: 0.1, // Lower threshold - trigger when 10% is visible
                    rootMargin: '0px 0px -100px 0px' // Only trigger when element is 100px into viewport
                }
            );
            
            if (cardElement) {
                console.log('Observing card element');
                observer.observe(cardElement);
                
                // Check if element is already visible
                const rect = cardElement.getBoundingClientRect();
                const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
                console.log('Element already visible?', isAlreadyVisible, 'rect:', rect);
                
                // If not already visible, we're good. If it is visible, trigger immediately
                if (isAlreadyVisible && !isVisible) {
                    console.log('Element already visible, triggering animation');
                    isVisible = true;
                    observer.disconnect();
                }
            } else {
                console.log('Card element not found');
            }
            
            return () => {
                observer.disconnect();
            };
        }, 100);
    });
</script>

 <div 
  bind:this={cardElement}
  class="w-full h-full rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 overflow-hidden relative"
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
      
      <div class="flex flex-grow flex-col justify-center items-center bg-white/10"> 
        <!-- Input Area -->
        <!-- <div class="flex-grow rounded-lg border border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-700">
          <p class="font-semibold text-gray-900 text-xs mt-3">Account Director, Digital Natives</p>
          <p class="mt-2 text-gray-600 text-xs">
            Our Sales team has a unique mission to help customers understand the deep impact that highly capable AI models can bring to their business and users. This role is a mixture of technical understanding, vision, partnership, and value-driven strategy.
           
            <span class="cursor"></span>
          </p>
        </div> -->
  
        <!-- Action Button -->
        <!-- <div class="mt-4 flex justify-center">
          <div class="glow-button flex w-full max-w-[80%] items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm relative overflow-hidden">
            <span>Get</span>
            <Logo variant="white" imgClass="h-3 w-auto sm:h-4" />
          </div>
        </div> -->
        <!-- {#if isVisible}
            <p style="color: green;">Card is visible - animation should trigger</p>
        {:else}
            <p style="color: red;">Card is not visible yet</p>
        {/if} -->
        <ScorePill 
		title="JobPostScore" 
		startScore={42} 
		endScore={98} 
		duration={8500}
		{isVisible}
	/>
  <!-- <div class="mt-4 bg-gray-200 p-4 rounded-lg">
    <p class="font-semibold text-gray-400 text-xl mt-3">JobPostScore 40</p>
    <p>Monitor your JobPostScore as you make changes, track improvements, and see how AI discoverability and candidate applications increase.</p>
  </div> -->
      </div>
    </div>
  </div>
  
 