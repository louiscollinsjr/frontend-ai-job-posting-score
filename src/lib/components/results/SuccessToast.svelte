<script lang="ts">
  import { resultsPageStore } from '$lib/stores/resultsPage';

  $: showSuccessMessage = $resultsPageStore.showSuccessMessage;

  function handleClose() {
    resultsPageStore.hideSuccessToast();
  }
</script>

{#if showSuccessMessage}
  <div class="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md transition-opacity duration-300 z-50 max-w-sm print:hidden">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <p>Report saved successfully!</p>
      </div>
      <button 
        class="ml-2 text-green-500 hover:text-green-700"
        on:click={handleClose}
        aria-label="Close notification"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  </div>
{/if}
