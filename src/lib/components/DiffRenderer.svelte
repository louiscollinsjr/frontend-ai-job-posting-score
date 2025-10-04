<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { DiffService, type DiffItem, type DiffAction, type DiffStats } from '$lib/services/diffService';
  
  const dispatch = createEventDispatcher<{
    textChanged: { text: string; stats: DiffStats };
  }>();
  
  export let originalText = '';
  export let improvedText = '';
  export let editable = true;
  
  let diff: DiffItem[] = [];
  let currentText = '';
  let hoveredIndex: number | null = null;
  
  // Generate diff when inputs change
  $: {
    diff = DiffService.generateDiff(originalText, improvedText);
    currentText = improvedText;
  }
  
  // Handle accept/reject actions
  function handleAction(index: number, action: DiffAction): void {
    const updatedText = DiffService.applyChange(diff, index, action);
    currentText = updatedText;
    
    // Regenerate diff with new current text as the "improved" version
    diff = DiffService.generateDiff(originalText, currentText);
    
    dispatch('textChanged', { 
      text: currentText,
      stats: DiffService.getDiffStats(diff)
    });
  }
  
  function onMouseEnter(index: number): void {
    if (editable) hoveredIndex = index;
  }
  
  function onMouseLeave(): void {
    hoveredIndex = null;
  }
</script>

<div class="diff-editor">
  <div class="diff-content text-sm leading-relaxed">
    {#each diff as item, index}
      {#if item.type === 'equal'}
        <span class="diff-equal">{item.value}</span>
      {:else if item.type === 'addition'}
        <span 
          class="diff-addition relative inline-block bg-green-100 border-l-4 border-green-400 px-1 py-0.5 rounded-sm"
          role="button"
          tabindex="0"
          on:mouseenter={() => onMouseEnter(index)}
          on:mouseleave={onMouseLeave}
          on:keydown={(e) => e.key === 'Enter' && onMouseEnter(index)}
        >
          {item.value}
          
          {#if hoveredIndex === index && editable}
            <div class="diff-controls absolute -top-8 left-0 z-10 bg-white border border-gray-300 rounded shadow-lg flex gap-1 p-1">
              <button
                class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                on:click={() => handleAction(index, 'accept')}
                title="Accept this addition"
              >
                ✓ Accept
              </button>
              <button
                class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                on:click={() => handleAction(index, 'reject')}
                title="Reject this addition"
              >
                ✗ Reject
              </button>
            </div>
          {/if}
        </span>
      {:else if item.type === 'deletion'}
        <span 
          class="diff-deletion relative inline-block bg-red-100 border-l-4 border-red-400 px-1 py-0.5 rounded-sm line-through text-gray-600"
          role="button"
          tabindex="0"
          on:mouseenter={() => onMouseEnter(index)}
          on:mouseleave={onMouseLeave}
          on:keydown={(e) => e.key === 'Enter' && onMouseEnter(index)}
        >
          {item.value}
          
          {#if hoveredIndex === index && editable}
            <div class="diff-controls absolute -top-8 left-0 z-10 bg-white border border-gray-300 rounded shadow-lg flex gap-1 p-1">
              <button
                class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                on:click={() => handleAction(index, 'accept')}
                title="Accept this deletion"
              >
                ✓ Accept
              </button>
              <button
                class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                on:click={() => handleAction(index, 'reject')}
                title="Reject this deletion (restore text)"
              >
                ✗ Reject
              </button>
            </div>
          {/if}
        </span>
      {/if}
    {/each}
  </div>
</div>

<style>
  .diff-editor {
    position: relative;
    line-height: 1.6;
  }
  
  .diff-content {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  
  .diff-equal {
    color: #374151;
  }
  
  .diff-addition {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .diff-addition:hover {
    background-color: rgb(187 247 208); /* bg-green-200 */
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .diff-deletion {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .diff-deletion:hover {
    background-color: rgb(254 202 202); /* bg-red-200 */
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .diff-controls {
    animation: fadeIn 0.2s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
