<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth';
  import GuestDashboard from '$lib/components/GuestDashboard.svelte';
  import { GuestManager } from '$lib/services/guestManager';

  let isLoggedIn = false;
  let hasReports = false;

  onMount(() => {
    // Check authentication status
    const unsubscribe = user.subscribe((val) => {
      isLoggedIn = !!(val?.id);
      
      // If user is logged in, redirect to main dashboard
      if (isLoggedIn) {
        goto('/dashboard');
        return;
      }
    });

    // Check if guest has any reports
    if (browser) {
      hasReports = GuestManager.hasAnyReports();
      
      // If no reports, redirect to home with a message
      if (!hasReports) {
        goto('/?msg=no-reports');
        return;
      }
    }

    return unsubscribe;
  });
</script>

<svelte:head>
  <title>Your Reports - JobPostScore</title>
  <meta name="description" content="View your cached JobPostScore reports and analyses." />
</svelte:head>

{#if browser && hasReports && !isLoggedIn}
  <GuestDashboard />
{:else}
  <!-- Loading state while checking authentication and reports -->
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <svg class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-500">Loading your reports...</p>
    </div>
  </div>
{/if}
