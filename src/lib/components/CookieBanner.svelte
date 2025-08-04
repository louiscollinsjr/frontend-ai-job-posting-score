<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let showBanner = false;

  // Check if user has already made a choice
  onMount(() => {
    if (browser) {
      const analyticsConsent = localStorage.getItem('analytics-consent');
      if (analyticsConsent === null) {
        showBanner = true;
      } else {
        showBanner = false;
        if (analyticsConsent === 'accepted' && window.posthog) {
          window.posthog.opt_in_capturing();
        }
      }
    }
  });

  // Accept analytics tracking
  function acceptAnalytics() {
    localStorage.setItem('analytics-consent', 'accepted');
    if (window.posthog) window.posthog.opt_in_capturing();
    showBanner = false;
  }
  
  // Decline analytics tracking
  function declineAnalytics() {
    localStorage.setItem('analytics-consent', 'declined');
    if (window.posthog) window.posthog.opt_out_capturing();
    showBanner = false;
  }
</script>

{#if showBanner}
  <div class="fixed bottom-4 left-0 right-0 bg-white shadow-lg z-[100] border-t border-gray-200 p-2 max-w-5xl mx-auto rounded-full">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-sm text-gray-600/70 px-4 w-[50%]">
        <p class="flex items-center">
          <img src="/Cookie.svg" alt="Cookie" class="w-6 h-6 inline" /> <span class="inline ml-4 text-xs font-aeonik tracking-wide">We use cookies to enhance your experience, analyze our traffic, and provide personalized content. Cookie preferences. Learn more in our <a href="/privacy" class="underline text-black font-medium">Privacy Policy</a>.</span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2 justify-center w-[30%]">
        <button 
          on:click={() => declineAnalytics()}
          class="px-4 py-2 text-gray-600 rounded-full bg-gray-50 text-xs font-aeonik tracking-wide border border-gray-300 hover:bg-gray-100"
        >
          Reject non-essential
        </button>
        <button 
          on:click={() => acceptAnalytics()}
          class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full text-xs font-aeonik tracking-wide hover:from-blue-700 hover:to-blue-900"
        >
          Accept all cookies
        </button>
      </div>
    </div>
  </div>
{/if}
