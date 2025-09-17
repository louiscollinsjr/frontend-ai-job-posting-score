<!-- src/lib/components/Card_NoGuessWork.svelte -->
<script>
    import Logo from '$lib/components/Logo.svelte';
    import ImageSlider from '$lib/components/ImageSlider.svelte';
</script>

 <div class="w-full h-full rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 bg-gradient-to-br from-[#c3cde1] to-[#dde3ee]">
    <!-- Mock Browser Window -->
    <div class="flex h-full flex-col overflow-hidden rounded-xl bg-white/60 shadow-inner">
      <!-- Browser Chrome (header) -->
      <div class="flex flex-shrink-0 items-center gap-2 border-none border-gray-200 bg-white/30 px-4 py-2.5">
        <div class="h-3 w-3 rounded-full bg-red-400"></div>
        <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
        <div class="h-3 w-3 rounded-full bg-green-400"></div>
      </div>
  
      <!-- Main Content Area -->
      <div class="flex flex-col h-full">
      <div class="flex flex-grow flex-col justify-between pt-4">
        <!-- Input Area -->
        <ImageSlider>
          <!-- The "Before" state (with issues) -->
          <div slot="before">
            <img 
              src="/Before.png" 
              alt="Job post before improvements"
              class="image-slider-content"
            />
          </div>
  
          <!-- The "After" state (with AI recommendations) -->
          <div slot="after">
            <img 
              src="/After.png" 
              alt="Job post after AI-driven improvements"
              class="image-slider-content"
            />
          </div>
        </ImageSlider>
      </div>
      <div class=" h-full">
        <div class="p-5" style="width: 100%; height: 100%;">
          <div class="h-full w-full rounded-3xl" style="background: linear-gradient(to right, #ef4444, #f59e0b, #10b981);"></div>
        </div>
      </div>  
     </div> 
    </div>
  </div>
  
 