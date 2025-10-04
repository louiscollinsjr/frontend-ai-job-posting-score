<script>
  /**
   * @typedef {Object} WorkingWellItem
   * @property {string} category - The category name
   * @property {string} description - The description text
   * @property {number} [score] - Optional score value
   */

  /** @type {WorkingWellItem[]} */
  export let items = [];
</script>

<div class="bg-white rounded-lg border shadow-sm">
  <div class="px-6 py-4 border-b">
    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
      <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
      What's Working Well
    </h3>
  </div>
  
  <div class="p-6 space-y-4">
    {#each items as item}
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h4 class="text-sm font-medium text-gray-900">{item.category}</h4>
          <p class="text-sm text-gray-600 mt-1">{item.description}</p>
          {#if item.score}
            <div class="text-xs text-green-600 font-medium mt-2">Score: {item.score}/100</div>
          {/if}
        </div>
      </div>
    {/each}
    
    {#if items.length === 0}
      <div class="text-center text-gray-500 py-4">
        <div class="text-2xl mb-2">👍</div>
        <p class="font-medium">Great foundation!</p>
        <p class="text-sm">We'll help optimize the areas that need improvement.</p>
      </div>
    {/if}
  </div>
</div>
