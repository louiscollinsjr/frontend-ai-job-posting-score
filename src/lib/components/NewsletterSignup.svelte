<script>
  import { createEventDispatcher } from 'svelte';
  
  export let heading = "Stay Updated";
  export let subheading = "Get the latest news and updates about ReachScore's inclusive job posting tools and features.";
  export let buttonText = "Subscribe";
  export let placeholder = "Enter your email";
  
  let email = "";
  let isSubmitting = false;
  let isSuccess = false;
  let errorMessage = "";
  
  const dispatch = createEventDispatcher();
  
  async function handleSubmit() {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorMessage = "Please enter a valid email address";
      return;
    }
    
    errorMessage = "";
    isSubmitting = true;
    
    try {
      // Here you would typically send the email to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 500));
      
      isSuccess = true;
      dispatch('subscribe', { email });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        isSuccess = false;
        email = "";
      }, 3000);
    } catch (error) {
      errorMessage = "Something went wrong. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<section class="relative w-full min-h-[340px] md:min-h-[420px] rounded-2xl my-8 flex items-center justify-start overflow-hidden bg-center bg-cover" >
  <div class="bg-white/0 max-w-lg w-full rounded-l-2xl px-6 py-10 md:px-10 md:py-16 flex flex-col items-start">
    <h2 class="text-2xl md:text-3xl font-bold mb-4 text-gray-900 text-left">{heading}</h2>
    <p class="text-base md:text-lg text-gray-600 mb-8 text-left leading-relaxed">{subheading}</p>
    {#if isSuccess}
      <div class="text-green-600 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-medium mb-4">
        Thank you for subscribing! We'll keep you updated with the latest news.
      </div>
    {:else}
      <form on:submit|preventDefault={handleSubmit} class="w-full">
        <div class="flex rounded-full overflow-hidden shadow-sm bg-white">
          <input
            type="email"
            bind:value={email}
            placeholder={placeholder}
            class="flex-grow px-5 py-3 text-base border border-gray-200 border-r-0 rounded-l-full outline-none bg-white"
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            class="px-7 py-3 bg-gray-900 text-white font-medium text-base rounded-r-full transition-colors duration-150 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <svg class="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
            {:else}
              {buttonText}
            {/if}
          </button>
        </div>
        {#if errorMessage}
          <div class="text-red-500 text-xs mt-2 pl-2">{errorMessage}</div>
        {/if}
      </form>
    {/if}
  </div>
</section>


