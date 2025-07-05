<script>
  // Props for the CTA component
  export let header = "This feels like having insider knowledge.";
  export let ctaText = "It is";
  export let ctaButtonText = "Get Started";
</script>

<div class="cta-container py-16 px-6 sm:px-8 md:px-12 lg:px-16 bg-white rounded-sm my-16">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-2xl md:text-5xl mb-4 text-black">{header}</h2>
    <p class="text-2xl md:text-5xl  font-normal text-black mb-8">{ctaText}</p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      
      <a href="/start" class="cta-button text-2xl font-bold flex items-center gap-2 bg-black hover:bg-gray-700 transition-colors duration-300 text-white font-medium py-2 px-8 rounded-full">
        {ctaButtonText}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" class="ml-1">
          <path fill="currentColor" d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path>
        </svg>
      </a>
    </div>
  </div>
</div>

<style>
  .cta-button {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
</style>
