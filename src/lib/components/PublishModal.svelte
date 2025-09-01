<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  
  const dispatch = createEventDispatcher();
  
  export let open = false;
  export let jobTitle = '';
  export let currentVersion = null;
  export let isPublishing = false;
  
  let selectedIntegration = 'finalize';
  
  const integrations = [
    { value: 'finalize', label: 'Finalize Version', description: 'Mark this version as complete and ready for use' }
  ];
  
  function handlePublish() {
    dispatch('publish', {
      integration: selectedIntegration,
      version: currentVersion
    });
  }
  
  function handleClose() {
    open = false;
    dispatch('close');
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Publish Job Posting</Dialog.Title>
      <Dialog.Description>
        Choose how you'd like to publish "{jobTitle || 'this job posting'}"
      </Dialog.Description>
    </Dialog.Header>
    
    <div class="space-y-4 py-4">
      {#if currentVersion}
        <div class="bg-gray-50 p-3 rounded-lg text-sm">
          <div class="font-medium">Publishing Version #{currentVersion.version_number}</div>
          <div class="text-gray-600 text-xs">
            Created {new Date(currentVersion.created_at).toLocaleDateString()}
          </div>
        </div>
      {/if}
      
      <div class="space-y-2">
        <label class="text-sm font-medium">Publishing Options</label>
        {#each integrations as integration}
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 {integration.disabled ? 'opacity-50 cursor-not-allowed' : ''}">
            <input 
              type="radio" 
              bind:group={selectedIntegration} 
              value={integration.value}
              disabled={integration.disabled}
              class="mt-1"
            />
            <div class="flex-1">
              <div class="font-medium text-sm">{integration.label}</div>
              <div class="text-xs text-gray-600">{integration.description}</div>
              {#if integration.disabled}
                <div class="text-xs text-blue-600 mt-1">Coming soon</div>
              {/if}
            </div>
          </label>
        {/each}
      </div>
    </div>
    
    <Dialog.Footer class="flex gap-2">
      <Button variant="outline" on:click={handleClose} disabled={isPublishing}>
        Cancel
      </Button>
      <Button on:click={handlePublish} disabled={isPublishing}>
        {#if isPublishing}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          Publishing...
        {:else}
          Publish
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
