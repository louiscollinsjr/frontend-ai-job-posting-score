<script>
  import FadeImage from './fade-image.svelte';
</script>

<div class="p-8 space-y-8">
  <h2 class="text-2xl font-bold mb-4">Image Fade Examples</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Top to bottom fade (default) -->
    <div class="space-y-2">
      <h3 class="font-medium">Top to Bottom Fade (Default)</h3>
      <div class="h-80 w-full bg-gray-100 rounded-lg overflow-hidden">
        <FadeImage 
          src="/ReachScoreGroup01.png" 
          alt="Fade Top to Bottom" 
          fadeDirection="bottom"
          fadeIntensity="medium"
        />
      </div>
    </div>
    
    <!-- Bottom to top fade -->
    <div class="space-y-2">
      <h3 class="font-medium">Bottom to Top Fade</h3>
      <div class="h-80 w-full bg-gray-100 rounded-lg overflow-hidden">
        <FadeImage 
          src="/ReachScoreGroup01.png" 
          alt="Fade Bottom to Top" 
          fadeDirection="top"
          fadeIntensity="medium"
        />
      </div>
    </div>
    
    <!-- Left to right fade -->
    <div class="space-y-2">
      <h3 class="font-medium">Left to Right Fade</h3>
      <div class="h-80 w-full bg-gray-100 rounded-lg overflow-hidden">
        <FadeImage 
          src="/ReachScoreGroup01.png" 
          alt="Fade Left to Right" 
          fadeDirection="right"
          fadeIntensity="medium"
        />
      </div>
    </div>
    
    <!-- Strong fade intensity -->
    <div class="space-y-2">
      <h3 class="font-medium">Strong Fade Intensity</h3>
      <div class="h-80 w-full bg-gray-100 rounded-lg overflow-hidden">
        <FadeImage 
          src="/ReachScoreGroup01.png" 
          alt="Strong Fade Intensity" 
          fadeDirection="bottom"
          fadeIntensity="strong"
        />
      </div>
    </div>
  </div>
</div>
