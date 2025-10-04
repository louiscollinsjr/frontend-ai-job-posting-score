<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import './JobRewrite.css';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Select from '$lib/components/ui/select';
  import { env } from '$env/dynamic/public';
  import DiffRenderer from './DiffRenderer.svelte';
  import PublishModal from './PublishModal.svelte';
  import AnalysisSidebar from './AnalysisSidebar.svelte';

  interface JobVersion {
    id: string;
    version_number: number;
    created_at: string;
    improved_text: string;
    [key: string]: unknown;
  }

  interface DiffStats {
    additions: number;
    deletions: number;
    totalChanges: number;
  }

  interface TextChangedDetail {
    text: string;
    stats?: DiffStats | null;
  }

  const { original_text = '', improvedText = '', score = 0, jobId = '' } = $props<{
    original_text?: string;
    improvedText?: string;
    score?: number;
    jobId?: string;
  }>();

  const API_BASE_URL =
    (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

  let versions = $state<JobVersion[]>([]);
  let loadingVersions = false;
  let selectedVersionId = $state<string>('');
  let isSaving = $state(false);
  let lastLoadedJobId = $state<string | null>(null);
  let mounted = $state(false);
  let currentEditorText = $state('');
  let diffStats = $state<DiffStats | null>(null);
  let showDiffView = $state(true);
  let showAnalysisSidebar = $state(true);
  let canPublish = $state(true);
  let showPublishModal = $state(false);
  let isPublishing = $state(false);

  onMount(() => {
    mounted = true;
    if (jobId) {
      lastLoadedJobId = jobId;
      void fetchVersions();
    }
  });

  $effect(() => {
    if (mounted && jobId && jobId !== lastLoadedJobId) {
      lastLoadedJobId = jobId;
      void fetchVersions();
    }
  });

  const selectedVersion = $derived.by(() =>
    selectedVersionId ? versions.find((version) => version.id === selectedVersionId) ?? null : null
  );

  $effect(() => {
    if (selectedVersion) {
      currentEditorText = selectedVersion.improved_text || improvedText;
    } else if (!currentEditorText && improvedText) {
      currentEditorText = improvedText;
    }
  });

  async function fetchVersions(): Promise<void> {
    if (!jobId || typeof window === 'undefined') {
      return;
    }

    loadingVersions = true;
    try {
      const sessionStr =
        window.localStorage.getItem('sb-zincimrcpvxtugvhimny-auth-token') ||
        window.localStorage.getItem('supabase.auth.token');
      if (!sessionStr) throw new Error('No session found');

      const token = JSON.parse(sessionStr)?.access_token as string | undefined;
      if (!token) throw new Error('Missing access token');

      const response = await fetch(`${API_BASE_URL}/api/v1/job/${jobId}/versions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as JobVersion[];
      versions = data;
      selectedVersionId = versions[0]?.id ?? '';
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      loadingVersions = false;
    }
  }

  async function copyToClipboard(text: string): Promise<void> {
    if (typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Clipboard write failed:', error);
    }
  }

  function toggleDiffView(): void {
    showDiffView = !showDiffView;
  }

  async function saveVersion(): Promise<void> {
    if (!jobId) {
      alert('Error: No job ID provided');
      return;
    }

    const textToSave = (currentEditorText || improvedText).trim();
    if (!textToSave) {
      alert('Error: No content to save');
      return;
    }

    isSaving = true;
    try {
      if (typeof window === 'undefined') throw new Error('Browser environment required');

      const sessionStr =
        window.localStorage.getItem('sb-zincimrcpvxtugvhimny-auth-token') ||
        window.localStorage.getItem('supabase.auth.token');
      if (!sessionStr) throw new Error('No session found');

      const token = JSON.parse(sessionStr)?.access_token as string | undefined;
      if (!token) throw new Error('Missing access token');

      const response = await fetch(`${API_BASE_URL}/api/v1/job/${jobId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          improved_text: textToSave
        })
      });

      if (!response.ok) {
        let details = '';
        try {
          details = await response.text();
        } catch {
          // no-op
        }
        throw new Error(`Failed to save version (${response.status} ${response.statusText}) ${details}`);
      }

      alert('Version saved successfully!');
      await fetchVersions();
    } catch (error) {
      console.error('Error saving version:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error saving version: ${errorMessage}`);
    } finally {
      isSaving = false;
    }
  }

  function publishVersion(): void {
    showPublishModal = true;
  }

  function handlePublish(): void {
    isPublishing = true;
    setTimeout(() => {
      isPublishing = false;
      showPublishModal = false;
      alert('Version finalized successfully!');
    }, 1000);
  }

  function handlePublishClose(): void {
    showPublishModal = false;
  }

  function handleTextChanged(event: CustomEvent<TextChangedDetail>): void {
    currentEditorText = event.detail.text;
    diffStats = event.detail.stats ?? null;
  }

  function formatVersionLabel(version: JobVersion): string {
    const created = new Date(version.created_at);
    return `Version #${version.version_number} - ${created.toLocaleDateString()}`;
  }
</script>

<!-- Version selector is now moved to the header -->

<div class="rewrite-container flex h-screen">
  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col {showAnalysisSidebar ? 'mr-80' : ''}">
    <!-- Header with controls -->
    <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 shadow-sm">
      <div class="flex items-center gap-4">
        <h3 class="text-xl font-semibold">Job Post Editor</h3>
        
        {#if versions.length > 0}
          <div class="w-48">
            <Select.Root type="single" bind:value={selectedVersionId}>
              <Select.Trigger>
                <span class="text-sm">
                  {#if selectedVersion}
                    {formatVersionLabel(selectedVersion)}
                  {:else}
                    Select version
                  {/if}
                </span>
              </Select.Trigger>
              <Select.Content>
                <Select.ScrollUpButton />
                <div class="select-viewport-container p-2">
                  {#each versions as version (version.id)}
                    <Select.Item value={version.id}>
                      {formatVersionLabel(version)}
                    </Select.Item>
                  {/each}
                </div>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select.Root>
          </div>
        {/if}
        
        <!-- View Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button 
            class="px-3 py-1 text-xs rounded {showDiffView ? 'bg-white shadow-sm' : 'text-gray-600'}"
            onclick={() => (showDiffView = true)}
          >
            Diff View
          </button>
          <button 
            class="px-3 py-1 text-xs rounded {!showDiffView ? 'bg-white shadow-sm' : 'text-gray-600'}"
            onclick={() => (showDiffView = false)}
          >
            Preview
          </button>
        </div>
        
        <!-- Diff Stats -->
        {#if diffStats && showDiffView}
          <div class="text-xs text-gray-600 flex gap-4">
            <span class="text-green-600">+{diffStats.additions} words</span>
            <span class="text-red-600">-{diffStats.deletions} words</span>
            <span>{diffStats.totalChanges} changes</span>
          </div>
        {/if}
        
        <!-- Analysis Toggle -->
        <button 
          class="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
          onclick={() => (showAnalysisSidebar = !showAnalysisSidebar)}
        >
          {showAnalysisSidebar ? 'Hide' : 'Show'} Analysis
        </button>
      </div>
      
      <div class="flex gap-2">
        <Button class="text-xs" size="sm" variant="outline" onclick={() => void copyToClipboard(currentEditorText)}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </Button>
        <Button 
          onclick={() => void saveVersion()}
          class="text-xs" 
          size="sm" 
          variant="outline" 
          disabled={isSaving}
        >
          {#if isSaving}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            Saving...
          {:else}
            Save Version
          {/if}
        </Button>
        <Button class="text-xs" size="sm" variant="secondary" disabled={!canPublish} onclick={publishVersion}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20v-6M9 17l3-3 3 3M12 4v6M9 7l3 3 3-3"></path>
          </svg>
          Finalize
        </Button>
      </div>
    </div>
    
    <!-- Main Editor Area -->
    <div class="flex-1 editor-content border-2 border-gray-200 rounded-lg overflow-hidden bg-white m-4">
      {#if showDiffView}
        <div class="p-6 h-full overflow-auto">
          <DiffRenderer 
            originalText={original_text}
            improvedText={selectedVersion ? selectedVersion.improved_text || improvedText : improvedText}
            editable={true}
            on:textChanged={handleTextChanged}
          />
        </div>
      {:else}
        <div class="posting-content text-sm p-6 markdown h-full overflow-auto">
          {@html marked.parse(currentEditorText || improvedText || '')}
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Analysis Sidebar -->
  {#if showAnalysisSidebar}
    <AnalysisSidebar 
      text={currentEditorText || improvedText}
      isCollapsed={false}
      realTimeAnalysis={true}
    />
  {/if}
</div>

<!-- Publish Modal -->
<PublishModal 
  bind:open={showPublishModal}
  jobTitle={`Job Post Version ${selectedVersion?.version_number ?? 'Current'}`}
  currentVersion={selectedVersion}
  isPublishing={isPublishing}
  on:publish={handlePublish}
  on:close={handlePublishClose}
/>

<!-- copy to remind users ai generated text can contain errors-->