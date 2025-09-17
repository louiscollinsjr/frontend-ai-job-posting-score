<script lang="ts">
  import SaveReportDialog from '$lib/components/SaveReportDialog.svelte';
  import { createEventDispatcher } from 'svelte';

  export let open: boolean;
  export let report: any;

  const dispatch = createEventDispatcher();

  function handleSubmit(event: any) {
    dispatch('submit', event.detail);
  }

  function handleClose() {
    open = false;
    dispatch('close');
  }
</script>

<SaveReportDialog
  bind:open
  {report}
  on:submit={handleSubmit}
  on:close={handleClose}
/>
