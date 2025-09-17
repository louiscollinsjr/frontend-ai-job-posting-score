<script lang="ts">
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { createEventDispatcher } from "svelte";
import MagicLinkLogin from './MagicLinkLogin.svelte';
import type { Report } from '$lib/types/report';

const dispatch = createEventDispatcher<{ submit: { email: string; report: Report | null } }>();

// Export the open prop for two-way binding
export let open: boolean = false;
export let report: Report | null = null;

// Log when open state changes
$: {
  console.log('SaveReportDialog open state changed:', open);
}

// Handle magic link submission from the MagicLinkLogin component
function handleMagicLinkSubmit(event: CustomEvent<{ email: string }>) {
  const { email } = event.detail;
  // Dispatch event to parent with both email and report data
  dispatch("submit", { email, report });
  // Close the dialog after submission
  open = false;
}
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger />
  <Dialog.Content class="max-w-md w-full">
    <Dialog.Title class="text-2xl font-bold my-4">
      <div class="flex flex-wrap items-center gap-1">
        <span>Save, return, and improve your</span>
        <img src="/jobpostscore_logo.svg" alt="JobPostScore" class="h-7 w-auto -mt-0.5 mx-0.5" />
        <span>for free.</span>
      </div>
    </Dialog.Title>
    <!-- <Dialog.Description class="mb-4 text-xs text-gray-600]">
      <div class="flex items-center gap-2 mb-2">
        
       Create a free account and unlock the full details of your <span><img src="/jobpostscore_logo.svg" alt="JobPostScore" class="h-4 w-auto" /></span>
      </div>
    </Dialog.Description> -->
    
    <!-- Use the MagicLinkLogin component for consistent login experience -->
    <div class="p-2">
      <MagicLinkLogin on:success={handleMagicLinkSubmit} compact={true} />
    </div>
    
    <div class="text-xs text-gray-500 mt-4 text-center">
      Having trouble logging in? <a href="mailto:support@jobpostingscore.com">Contact support</a>
    </div>
  </Dialog.Content>
</Dialog.Root>
