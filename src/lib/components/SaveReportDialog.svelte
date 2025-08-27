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
    <Dialog.Title class="text-lg font-bold mb-2">Save your report</Dialog.Title>
    <Dialog.Description class="mb-4 text-sm text-gray-600">
      Want to save this report to view later? <br />
      <span class="text-gray-900">We'll send you a link to access this anytime.</span>
    </Dialog.Description>
    
    <!-- Use the MagicLinkLogin component for consistent login experience -->
    <div class="p-2">
      <MagicLinkLogin on:success={handleMagicLinkSubmit} compact={true} />
    </div>
    
    <div class="text-xs text-gray-500 mt-4">
      Already have an account? Check your email for the login link.
    </div>
  </Dialog.Content>
</Dialog.Root>
