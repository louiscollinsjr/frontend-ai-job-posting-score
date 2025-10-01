<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import * as Button from '$lib/components/ui/button';
  import * as Alert from '$lib/components/ui/alert';
  import Breadcrumbs from '$lib/components/navigation/Breadcrumbs.svelte';

  let reportId = null;
  let jsonLdData = null;
  let loading = true;
  let error = null;

  const API_BASE_URL = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

  onMount(async () => {
    reportId = $page.url.searchParams.get('report');
    if (reportId) {
      await fetchJsonLd();
    } else {
      error = 'No report ID provided';
      loading = false;
    }
  });

  async function fetchJsonLd() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/generate-jsonld/${reportId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON-LD: ${response.status}`);
      }
      jsonLdData = await response.json();
    } catch (err) {
      error = err.message;
      console.error('Error fetching JSON-LD:', err);
    } finally {
      loading = false;
    }
  }

  function downloadJsonLd() {
    if (!jsonLdData) return;
    
    const jsonString = JSON.stringify(jsonLdData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-posting-${reportId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyToClipboard() {
    if (!jsonLdData) return;
    
    const jsonString = JSON.stringify(jsonLdData, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('JSON-LD copied to clipboard!');
    });
  }
</script>

<svelte:head>
  <title>JSON-LD Schema - JobPostScore</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 pt-32 max-w-7xl">
  <Breadcrumbs items={[
    { label: 'My JobPostScore', href: '/dashboard' },
    { label: 'JSON-LD' }
  ]} />
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">JSON-LD Schema</h1>
    <p class="text-gray-600">Structured data for your job posting</p>
  </div>

  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  {:else if error}
    <Alert.Root class="mb-6">
      <Alert.Description>
        Error loading JSON-LD: {error}
      </Alert.Description>
    </Alert.Root>
  {:else if jsonLdData}
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Generated Schema</h2>
        <div class="flex gap-2">
          <Button.Root on:click={copyToClipboard} variant="outline" size="sm">
            Copy to Clipboard
          </Button.Root>
          <Button.Root on:click={downloadJsonLd} variant="default" size="sm" class="bg-black hover:bg-gray-800 text-white">
            Download JSON
          </Button.Root>
        </div>
      </div>
      
      <div class="bg-gray-100 rounded-md p-4 overflow-x-auto">
        <pre class="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(jsonLdData, null, 2)}</pre>
      </div>
      
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h3 class="text-lg font-medium mb-3">How to use this schema</h3>
        <div class="text-sm text-gray-600 space-y-2">
          <p><strong>1.</strong> Copy the JSON-LD schema above</p>
          <p><strong>2.</strong> Add it to your website's HTML head section inside a script tag:</p>
          <div class="bg-gray-100 rounded p-3 mt-2 font-mono text-xs">
            &lt;script type="application/ld+json"&gt;<br>
            <!-- Your JSON-LD data here --><br>
            &lt;/script&gt;
          </div>
          <p><strong>3.</strong> This will help search engines better understand your job posting</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- <div class="mt-8 flex justify-end">
    <a href="/dashboard" class="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-gray-300">
      ← Back to Dashboard
    </a>
  </div> -->
</div>
