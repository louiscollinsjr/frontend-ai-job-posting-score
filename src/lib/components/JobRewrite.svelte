<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import './JobRewrite.css';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Select from '$lib/components/ui/select/index.js';
  
  export let original_text = '';
  export let improvedText = '';
  export let recommendations = [];
  export let score = 0; // This could be the DB total_score or a calculated score
  export let jobId = '';
  
  // Format score for display
  $: formattedScore = typeof score === 'number' ? Math.round(score) : 0;
  
  let versions = [];
  let loadingVersions = false;
  let selectedVersion = null;
  let isMarkdownEnabled = true; // Add a variable to control markdown rendering

  async function fetchVersions() {
    loadingVersions = true;
    try {
      const response = await fetch(`/api/job/${jobId}/versions`);
      versions = await response.json();
      if (versions.length > 0) selectedVersion = versions[0];
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      loadingVersions = false;
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  onMount(fetchVersions);
  
  // Compute the markdown HTML for improved text
  $: improvedMarkdown = marked.parse(selectedVersion ? selectedVersion.improved_text || '' : improvedText || '');
</script>

<!-- Version selector is now moved to the header -->

<div class="rewrite-container text-sm h-[50vh] pb-8">
  <div class="original-posting h-[50vh] border-2 border-gray-200 rounded-2xl overflow-auto bg-[#f9fafb]">
    <div class="sticky top-0 bg-[#f9fafb] border-b border-gray-200 p-3 flex justify-between items-center rounded-none">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-medium text-gray-600">Original Posting Text</h3>
      </div>
      <div>
        <!-- <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          {formattedScore >= 90 ? 'bg-green-100 text-green-800' : 
           formattedScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
           'bg-red-100 text-red-800'}"
        >
          Score: {formattedScore}
        </span> -->
      </div>
    </div>
    <div class="posting-content p-6">{original_text}</div>
  </div>

<div class="improved-posting  h-[50vh] border-2 border-black rounded-2xl overflow-auto">
  <div class="sticky top-0 bg-white border-b border-gray-200 p-3 flex justify-between items-center rounded-none">
    <div class="flex items-center gap-3">
      <h3 class="text-lg font-medium">Improved Version</h3>
      
      {#if versions.length > 0}
        <div class="w-48">
          <Select.Root bind:value={selectedVersion}>
            <Select.Trigger>
              <span class="text-sm">
                {#if selectedVersion}
                  Version #{selectedVersion.version_number}
                {:else}
                  Select version
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              <Select.ScrollUpButton />
              <Select.Viewport>
                {#each versions as version (version.id)}
                  <Select.Item value={version}>
                    Version #{version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                  </Select.Item>
                {/each}
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </Select.Root>
        </div>
      {/if}
    </div>
    
    <div class="flex gap-2">
      <Button class="text-xs" size="sm" variant="outline" on:click={() => copyToClipboard(selectedVersion?.improved_text || improvedText)}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy
      </Button>
      <Button class="text-xs" size="sm" variant="outline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Save
      </Button>
      <Button class="text-xs" size="sm" variant="secondary" disabled>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20v-6M9 17l3-3 3 3M12 4v6M9 7l3 3 3-3"></path>
        </svg>
        Publish
      </Button>
    </div>
  </div>
  <div class="posting-content text-sm p-6" class:markdown={isMarkdownEnabled}>
    {@html improvedMarkdown}
  </div>
  <!-- <div class="actions">
    <button on:click={() => copyToClipboard(selectedVersion?.improved_text || improvedText)}>
      Copy Improved Text
    </button>
  </div> -->
</div>
</div>
<!-- <div class="mt-8">
  {#if recommendations.length > 0}
    <div class="recommendations">
      <h4>Improvements Based On:</h4>
      <ul>
        {#each recommendations as rec}
          <li>{rec}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div> -->

<!-- copy to remind users ai generated text can contain errors-->