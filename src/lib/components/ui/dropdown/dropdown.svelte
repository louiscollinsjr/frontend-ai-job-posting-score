<script lang="ts">
  import { createPopperActions } from 'svelte-popperjs';
  import { fade } from 'svelte/transition';
  import { clickOutside } from '$lib/utils/click-outside';
  import { createEventDispatcher } from 'svelte';
  
  export let open = false;
  
  const dispatch = createEventDispatcher();
  
  const [popperRef, popperContent] = createPopperActions({
    placement: 'bottom-end',
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
    ],
  });
  
  function handleClickOutside() {
    dispatch('close');
  }
</script>

<div class="relative inline-block text-left">
  <div use:popperRef>
    <slot name="trigger" {open} />
  </div>
  
  {#if open}
    <div 
      use:popperContent
      use:clickOutside={{ enabled: open, callback: handleClickOutside }}
      transition:fade={{ duration: 100 }}
      class="z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    >
      <slot />
    </div>
  {/if}
</div>
