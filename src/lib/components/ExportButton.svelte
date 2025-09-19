<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { ExportFormat, ExportData } from '$lib/utils/exportUtils';
  import { exportReport } from '$lib/utils/exportUtils';

  export let data: ExportData;
  export let disabled: boolean = false;

  let isOpen = false;
  let isExporting = false;
  let exportingFormat: ExportFormat | null = null;

  const dispatch = createEventDispatcher();

  const formatOptions = [
    { value: 'docx' as ExportFormat, label: 'Word Document (.docx)', emoji: '📄', description: 'Professional format for editing' },
    { value: 'pdf' as ExportFormat, label: 'PDF Document (.pdf)', emoji: '📋', description: 'Print-ready format' },
    { value: 'txt' as ExportFormat, label: 'Text File (.txt)', emoji: '📝', description: 'Simple text format' }
  ];

  async function handleExport(format: ExportFormat, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (isExporting || disabled) return;

    isExporting = true;
    exportingFormat = format;
    isOpen = false;

    try {
      await exportReport(format, data);
      dispatch('exported', { format });
    } catch (error) {
      console.error('Export failed:', error);
      dispatch('export-error', { format, error });
    } finally {
      isExporting = false;
      exportingFormat = null;
    }
  }

  function toggleDropdown(event: MouseEvent) {
    console.log('Toggle dropdown clicked, isOpen:', isOpen, 'disabled:', disabled, 'isExporting:', isExporting);
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !isExporting) {
      isOpen = !isOpen;
      console.log('Dropdown toggled to:', isOpen);
    }
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    const dropdown = target.closest('.export-dropdown');
    if (!dropdown && isOpen) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative export-dropdown">
  <button
    class="px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 {isExporting ? 'opacity-50' : ''} {disabled ? 'cursor-not-allowed' : ''}"
    {disabled}
    on:click={toggleDropdown}
    type="button"
  >
    {#if isExporting}
      Exporting...
    {:else}
      Export Report
    {/if}
    <span class="transition-transform {isOpen ? 'rotate-180' : ''}">▼</span>
    {#if isOpen}<span class="ml-1 text-green-400">●</span>{/if}
  </button>

  {#if isOpen && !disabled && !isExporting}
    <div class="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200" style="z-index: 9999;">
      <div class="py-2">
        {#each formatOptions as option}
          <button
            class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors"
            on:click={(e) => handleExport(option.value, e)}
            disabled={isExporting}
          >
            <!-- <span class="text-lg mt-0.5">{option.emoji}</span> -->
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{option.label}</div>
              <div class="text-xs text-gray-500">{option.description}</div>
            </div>
            {#if exportingFormat === option.value}
              <div class="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent mt-0.5"></div>
            {/if}
          </button>
        {/each}
      </div>
      
      <div class="border-t border-gray-100 px-4 py-2">
        <div class="text-xs text-gray-500">
          Choose your preferred format for the optimized job posting
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .export-dropdown {
    /* Ensure dropdown appears above other elements */
    z-index: 50;
  }
</style>
