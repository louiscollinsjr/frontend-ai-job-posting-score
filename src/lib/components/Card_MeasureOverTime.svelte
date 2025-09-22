<!-- src/lib/components/Card_MeasureOverTime.svelte -->
<script>
    import Logo from '$lib/components/Logo.svelte';
    import ScorePill from '$lib/components/ScorePill.svelte';
    
    export let background = '';
</script>

 <div 
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
        <ScorePill 
		title="JobPostScore" 
		startScore={42} 
		endScore={98} 
		duration={8500} 
	/>
  <!-- <div class="mt-4 bg-gray-200 p-4 rounded-lg">
    <p class="font-semibold text-gray-400 text-xl mt-3">JobPostScore 40</p>
    <p>Monitor your JobPostScore as you make changes, track improvements, and see how AI discoverability and candidate applications increase.</p>
  </div> -->
      </div>
    </div>
  </div>
  
 