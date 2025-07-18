<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as Button from '$lib/components/ui/button/index.js';
  
  let showBanner = false;
  
  // Check if user has already made a choice
  onMount(() => {
    if (browser) {
      const analyticsConsent = localStorage.getItem('analytics-consent');
      if (analyticsConsent === null) {
        // No choice made yet, show banner
        showBanner = true;
      } else if (analyticsConsent === 'accepted') {
        // User accepted analytics, enable PostHog
        enablePostHog();
      }
    }
  });

  // Enable PostHog tracking
  function enablePostHog() {
    if (browser && window.posthog) {
      window.posthog.opt_in_capturing();
    }
  }

  // Disable PostHog tracking
  function disablePostHog() {
    if (browser && window.posthog) {
      window.posthog.opt_out_capturing();
    }
  }
  
  // Accept analytics tracking
  function acceptAnalytics() {
    localStorage.setItem('analytics-consent', 'accepted');
    enablePostHog();
    showBanner = false;
  }
  
  // Decline analytics tracking
  function declineAnalytics() {
    localStorage.setItem('analytics-consent', 'declined');
    disablePostHog();
    showBanner = false;
  }
</script>

{#if showBanner}
  <div class="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-[100] border-t border-gray-200 p-4">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-sm text-gray-700 pr-4">
        <p>
          We use analytics to understand how our service is used and improve our features.
          No personal data is collected. Learn more in our <a href="/privacy" class="underline text-black font-medium">Privacy Policy</a>.
        </p>
      </div>
      <div class="flex flex-wrap gap-2 justify-end">
        <Button.Root on:click={declineAnalytics} variant="outline" size="sm">
          Decline
        </Button.Root>
        <Button.Root on:click={acceptAnalytics} variant="default" size="sm" class="bg-black text-white hover:bg-gray-800">
          Accept
        </Button.Root>
      </div>
    </div>
  </div>
{/if}
