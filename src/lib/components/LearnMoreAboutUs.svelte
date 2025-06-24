<script>
  // Props for customization
  export let title = "Learn more about us";
  export let subtitle = "WANT TO KNOW MORE ABOUT US?";
  export let href = "/about";
</script>

<a 
  {href}
  class="block bg-white hover:bg-gray-100 transition-colors duration-300 rounded-2xl border-2 border-gray-100 p-8 mb-8"
>
  <div class="px-8">
    <!-- Subtitle at the top -->
    {#if subtitle}
      <p class="text-xs uppercase font-medium tracking-wider text-gray-400 mb-16">{subtitle}</p>
    {/if}
    
    <!-- Flex layout with precise positioning -->
    <div class="flex justify-between items-center">
      <h2 class="text-4xl font-normal tracking-tight text-gray-900">{title}</h2>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </div>
  </div>
</a>
