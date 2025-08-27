<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import JobRewrite from '$lib/components/JobRewrite.svelte';
  import { toast } from 'svelte-sonner';
  import * as Alert from '$lib/components/ui/alert';
  import * as Button from '$lib/components/ui/button';
  import { env } from '$env/dynamic/public';

  // Query parameters
  let reportId = '';
  let viewOnly = false;
  let isLoading = true;
  let error = null;

  // Report data
  let originalText = '';
  let improvedText = '';
  let recommendations = [];
  let score = 0;
  let rewriteVersions = [];
  const API_BASE_URL = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

  onMount(async () => {
    // Get query parameters
    reportId = $page.url.searchParams.get('report') || '';
    viewOnly = $page.url.searchParams.get('view_only') === 'true';
    const versionsPage = Number($page.url.searchParams.get('page') || '1');
    const versionsLimit = Number($page.url.searchParams.get('limit') || '20');
    
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
      const token = JSON.parse(sessionStr)?.access_token;

      // Log request details for debugging
      console.log(`Fetching report with ID: ${reportId}`);
      console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
      
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

      let reportData = {};
      if (response.ok) {
        reportData = await response.json();
        originalText = reportData.original_text || '';
        score = reportData.total_score || 0;
      } else {
        // Set defaults if we couldn't get the original report
        originalText = 'Original report text not available';
        score = 0;
      }

      // Fetch rewrite versions (history)
      try {
        // Log request details for rewrite versions
        const versionsUrl = `${API_BASE_URL}/api/v1/job/${reportId}/versions?page=${versionsPage}&limit=${versionsLimit}`;
        console.log(`Making versions request to: ${versionsUrl}`);
        
        const versionsResp = await fetch(versionsUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Log versions response
        console.log(`Versions fetch response status: ${versionsResp.status}`);
        
        if (versionsResp.ok) {
          rewriteVersions = await versionsResp.json();
          console.log(`Fetched ${rewriteVersions.length} rewrite versions:`, rewriteVersions);
          
          // If we got versions but no original report, create a placeholder
          if (!response.ok && rewriteVersions.length > 0) {
            console.log('Creating placeholder original report from versions');
            // The report fetch failed but we have versions, so show those
            originalText = 'Original report not available';
            // Use the most recent version's data for display if needed
          }
        } else {
          console.warn(`Failed to fetch rewrite versions: ${versionsResp.status} ${versionsResp.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching rewrite versions:', err);
      }

      // If we're not in view-only mode and there are no versions yet,
      // we could potentially offer to create a new rewrite

      isLoading = false;
    } catch (err) {
      console.error('Error fetching report data:', err);
      error = 'Error loading report data';
      isLoading = false;
    }
  });

  function goBack() {
    history.back();
  }
</script>

<div class="container mx-auto px-4 py-8 pt-32 ">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">
      {#if viewOnly}
        Rewrite History
      {:else}
        Job Rewrite
      {/if}
    </h1>
    <Button.Root variant="outline" on:click={goBack}>
      Back to Dashboard
    </Button.Root>
  </div>

  {#if isLoading}
    <div class="flex justify-center items-center h-96">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
    </div>
  {:else if error}
    <Alert.Root>
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{error}</Alert.Description>
    </Alert.Root>
  {:else}
    <JobRewrite
      original_text={originalText}
      improvedText={improvedText}
      recommendations={recommendations}
      score={score}
      jobId={reportId}
      rewriteVersions={rewriteVersions}
    />
  {/if}
</div>
