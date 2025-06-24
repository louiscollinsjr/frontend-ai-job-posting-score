<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import AuditForm from '$lib/components/AuditForm.svelte';
  
  let loading = true;
  let userEmail = '';
  
  onMount(async () => {
    // Initialize the user store
    await user.init();
    
    // Subscribe to user changes
    const unsubscribe = user.subscribe((userData) => {
      if (!userData) {
        // Redirect to login if not authenticated
        goto('/login');
      } else {
        userEmail = userData.email;
      }
      loading = false;
    });
    
    return unsubscribe;
  });
  
  function handleAudit(event) {
    // Handle the audit submission
    console.log('Audit submitted:', event.detail);
    // You can add additional logic here to save the audit to the user's account
  }
</script>

<div class="container mx-auto px-4 py-8">
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  {:else}
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-xl shadow-none p-6 mb-8">
        <h1 class="text-2xl font-bold mb-2 text-center">Dashboard</h1>
        <p class="text-gray-600 mb-6 text-center">Submit a job posting for analysis below.</p>
        
        <div class="mb-8">
          <AuditForm on:audit={handleAudit} />
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-none p-6">
        <h2 class="text-xl font-semibold mb-4">Your Recent Reports</h2>
        <!-- This would be populated with the user's previous audits -->
        <p class="text-gray-500 italic">No reports yet. Submit your first job posting above!</p>
      </div>
    </div>
  {/if}
</div>
