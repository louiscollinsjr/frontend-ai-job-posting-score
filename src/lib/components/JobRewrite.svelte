<script>
  import { onMount } from 'svelte';
  import './JobRewrite.css';
  
  export let original_text = '';
  export let improvedText = '';
  export let recommendations = [];
  export let score = 0;
  export let jobId = '';
  
  let versions = [];
  let loadingVersions = false;
  let selectedVersion = null;

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
</script>

<div class="version-selector">
  {#if loadingVersions}
    <p>Loading versions...</p>
  {:else if versions.length > 0}
    <select bind:value={selectedVersion}>
      {#each versions as version (version.id)}
        <option value={version}>
          Version {version.version_number} - {new Date(version.created_at).toLocaleString()}
        </option>
      {/each}
    </select>
  {/if}
</div>

<div class="rewrite-container">
  <div class="original-posting">
    <h3>Original Posting (Score: {score})</h3>
    <div class="posting-content">{original_text}</div>
  </div>
  
  <div class="improved-posting">
    <h3>Improved Version {selectedVersion ? `#${selectedVersion.version_number}` : ''}</h3>
    <div class="posting-content">
      {selectedVersion ? selectedVersion.improved_text : improvedText}
    </div>
    <div class="actions">
      <button on:click={() => copyToClipboard(selectedVersion?.improved_text || improvedText)}>
        Copy Improved Text
      </button>
    </div>
  </div>
  
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
</div>
