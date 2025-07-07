<script>
  // Props for customization
  export let quote = "I ran three job posts through IntelliScore and finally saw why our reach was flat.";
  export let author = "— Talent Lead, Beta User";
  export let trustMessage = "Now in private beta with global TA teams. IntelliScore is helping recruiters surface listings before they get lost.";
</script>

<div class="trust-quote-container py-16 px-6 sm:px-8 md:px-12 lg:px-16 bg-white border-2 border-gray-100 rounded-2xl my-16">
  <div class="max-w-4xl mx-auto flex flex-col items-center">
    <!-- Quote Section -->
    <div class="text-center mb-10">
      <!-- Quote Icon -->
      <div class="mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300 mx-auto">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
        </svg>
      </div>
      
      <!-- Quote Text -->
      <p class="text-2xl md:text-3xl max-w-2xl mx-auto font-normal text-gray-800 mb-4 leading-relaxed tracking-tight">"{quote}"</p>
      
      <!-- Author -->
      <p class="text-sm md:text-sm text-gray-500">{author}</p>
    </div>
    
    <!-- Divider -->
    <div class="w-24 h-px bg-gray-200 mb-10"></div>
    
    <!-- Trust Line -->
    <div class="text-center">
     
      
      <!-- Trust Message -->
      <p class="text-xs md:text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">{trustMessage}</p>
    </div>
  </div>
</div>

<style>
  /* Optional: Add a subtle gradient text effect for the quote */
  .trust-quote-container p:first-of-type {
    background: linear-gradient(90deg, #2d3748, #4a5568);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
</style>
