<script>
  import { createEventDispatcher } from 'svelte';
  import { auditJobUrl, auditJobText } from '$lib/api/audit.js';
  
  // Create a dispatcher to send events to parent components
  const dispatch = createEventDispatcher();
  
  // Form state variables
  let inputType = 'url'; // Default to URL input
  let jobUrl = '';
  let jobDescription = '';
  let isLoading = false;
  let error = '';
  
  // Form validation state
  let isUrlValid = true;
  let isDescriptionValid = true;
  
  // Toggle between URL and text input
  function setInputType(type) {
    inputType = type;
    error = ''; // Clear any errors when switching
  }
  
  // Validate URL format
  function validateUrl(url) {
    // Basic URL validation
    const pattern = /^(https?:\/\/)?(([\da-z.-]+)\.([a-z.]{2,6})|(([\d.]+)|(\[[a-f0-9:]+\])))(:[0-9]+)?([/\w .-]*)*\/?$/;
    return pattern.test(url);
  }
  
  // Validate text input
  function validateDescription(text) {
    return text.trim().length > 50; // Minimum 50 characters
  }
  
  // Handle form submission
  async function handleSubmit() {
    error = '';
    
    // Validate based on input type
    if (inputType === 'url') {
      isUrlValid = validateUrl(jobUrl);
      if (!isUrlValid || !jobUrl) {
        error = 'Please enter a valid job posting URL';
        return;
      }
    } else {
      isDescriptionValid = validateDescription(jobDescription);
      if (!isDescriptionValid) {
        error = 'Please enter a job description (minimum 50 characters)';
        return;
      }
    }
    
    // Set loading state
    isLoading = true;
    
    // Send data to API
    try {
      let results;
      
      if (inputType === 'url') {
        results = await auditJobUrl(jobUrl);
      } else {
        results = await auditJobText(jobDescription);
      }
      
      // Send event to parent with form data and results
      dispatch('audit', {
        type: inputType,
        data: inputType === 'url' ? jobUrl : jobDescription,
        results
      });
      
    } catch (e) {
      error = 'An error occurred while analyzing the job posting. Please try again.';
      console.error('Audit submission error:', e);
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="audit-form-container bg-white shadow-md rounded-lg p-6 md:p-8 max-w-3xl mx-auto">
  <div class="mb-8">
    <div class="flex justify-center mb-4">
      <div class="inline-flex rounded-md shadow-sm" role="group" aria-label="Input type selection">
        <button 
          type="button"
          class="px-4 py-2 text-sm font-medium rounded-l-lg {inputType === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}"
          on:click={() => setInputType('url')}
          aria-pressed={inputType === 'url'}
        >
          URL
        </button>
        <button 
          type="button"
          class="px-4 py-2 text-sm font-medium rounded-r-lg {inputType === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}"
          on:click={() => setInputType('text')}
          aria-pressed={inputType === 'text'}
        >
          Text Input
        </button>
      </div>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      {#if inputType === 'url'}
        <div class="form-control">
          <label for="job-url" class="block text-sm font-medium text-gray-700 mb-1">Job Posting URL</label>
          <input
            type="text"
            id="job-url"
            placeholder="https://example.com/job-posting"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all {!isUrlValid ? 'border-red-500' : ''}"
            bind:value={jobUrl}
            disabled={isLoading}
          />
          {#if !isUrlValid && error}
            <p class="mt-1 text-sm text-red-600">{error}</p>
          {/if}
        </div>
      {:else}
        <div class="form-control">
          <label for="job-description" class="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            id="job-description"
            placeholder="Paste your job description here..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[200px] {!isDescriptionValid ? 'border-red-500' : ''}"
            bind:value={jobDescription}
            disabled={isLoading}
          ></textarea>
          {#if !isDescriptionValid && error}
            <p class="mt-1 text-sm text-red-600">{error}</p>
          {/if}
        </div>
      {/if}
      
      {#if error && isUrlValid && isDescriptionValid}
        <div class="error-message p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      {/if}
      
      <div class="form-submit">
        <button
          type="submit"
          class="w-full py-3 px-6 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex justify-center items-center"
          disabled={isLoading}
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          {:else}
            Analyze Posting
          {/if}
        </button>
      </div>
    </form>
  </div>
</section>
