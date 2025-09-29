<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import JobRewrite from '$lib/components/JobRewrite.svelte';
  import * as Alert from '$lib/components/ui/alert';
  import * as Button from '$lib/components/ui/button';
  import { env } from '$env/dynamic/public';

  // Query parameters
  let reportId: string = '';
  let isLoading: boolean = true;
  let error: string | null = null;

  // Report data
  let originalText: string = '';
  let improvedText: string = '';
  let score: number = 0;
  const API_BASE_URL: string = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

  onMount(async () => {
    // Get query parameters
    reportId = $page.url.searchParams.get('report') || '';
    // Versions are fetched inside JobRewrite; page and limit are not needed here
    
    if (!reportId) {
      error = 'No report ID provided';
      isLoading = false;
      return;
    }

    try {
      // Fetch report data
      const sessionStr = localStorage.getItem('sb-zincimrcpvxtugvhimny-auth-token');
      if (!sessionStr) {
        error = 'Authentication required';
        goto('/login');
        return;
      }
      const token: string | undefined = JSON.parse(sessionStr)?.access_token;

      // Log request details for debugging
      console.log(`Fetching report with ID: ${reportId}`);
      if (typeof token === 'string') {
        console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
      }
      
      // Fetch the report details including original text
      const reportUrl = `${API_BASE_URL}/api/v1/reports/${reportId}`;
      console.log(`Making request to: ${reportUrl}`);
      
      const response = await fetch(reportUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Log response details
      console.log(`Report fetch response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch report data: ${response.status} ${response.statusText}`);
        // Continue execution - don't block on report fetch failure
        // We'll try to fetch rewrite versions anyway
        // error = 'Failed to fetch report data';
        // isLoading = false;
        // return;
      }

      let reportData: { original_text?: string; total_score?: number } = {};
      if (response.ok) {
        reportData = await response.json();
        originalText = reportData.original_text || '';
        score = reportData.total_score || 0;
      } else {
        // Set defaults if we couldn't get the original report
        originalText = 'Original report text not available';
        score = 0;
      }

      // Versions are fetched inside JobRewrite; no need to duplicate here.

      // If we're not in view-only mode and there are no versions yet,
      // we could potentially offer to create a new rewrite

      isLoading = false;
    } catch (err: unknown) {
      console.error('Error fetching report data:', err);
      error = 'Error loading report data';
      isLoading = false;
    }
  });

  function goBack() {
    history.back();
  }
</script>

<div class="h-screen overflow-hidden">
  {#if isLoading}
    <div class="flex justify-center items-center h-full">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
        <p class="text-gray-600">Loading job posting editor...</p>
      </div>
    </div>
  {:else if error}
    <div class="flex justify-center items-center h-full">
      <Alert.Root class="max-w-md">
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
        <!-- <div class="mt-4">
          <Button.Root variant="outline" on:click={goBack}>
            ←  Back to Dashboard
          </Button.Root>
        </div> -->
      </Alert.Root>
    </div>
  {:else}
    <!-- Full-screen editor -->
    <JobRewrite
      original_text={originalText}
      improvedText={improvedText}
      score={score}
      jobId={reportId}
    />
    
    <!-- Floating back button -->
    <div class="fixed top-4 left-4 z-20">
      <Button.Root variant="outline" size="sm" on:click={goBack}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </Button.Root>
    </div>
  {/if}
</div>
