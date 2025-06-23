<script>
  // Props for the feature card
  export let icon = ""; // Icon SVG string or component
  export let title = ""; // Feature title
  export let description = ""; // Feature description
</script>

<div class="feature-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
  <div class="feature-icon mb-4 text-indigo-600">
    {#if icon}
      <!-- If icon is provided as HTML/SVG string -->
      {@html icon}
    {/if}
  </div>
  
  <h3 class="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
  
  <p class="text-gray-600">{description}</p>
</div>
