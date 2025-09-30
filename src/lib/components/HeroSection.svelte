<script>
	import AuditForm from '$lib/components/AuditForm.svelte';
	import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';
	import GuestReportBadge from '$lib/components/GuestReportBadge.svelte';
	import { createEventDispatcher } from 'svelte';

	// Props
	export let isLoggedIn = false;
	export let hasGuestReports = false;
	export let authChecked = false;

	// Create dispatcher for events
	const dispatch = createEventDispatcher();

	// Handle audit form submission
	function handleAudit(event) {
		dispatch('audit', event);
	}
</script>

<div class="relative w-full min-h-[75vh] sm:min-h-[85vh] max-h-[900px] pb-8 sm:pb-24">
	<!-- Hero Section with Audit Form -->
	<section class="mb-4 sm:mb-8 bg-[radial-gradient(ellipse_at_center,_#f8f8f8_0%,_transparent_70%)] p-2 min-h-[70vh] sm:min-h-[85vh] relative">
		<div class="container mx-auto pt-8 sm:pt-16">
			<div class="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start mx-auto">
				<div class="px-4 lg:px-16 pb-10 sm:pb-24 rounded-3xl min-h-0 sm:min-h-[680px] mx-auto pt-6 sm:pt-20 w-full">
					<!-- Guest Report Badge - Shows last cached report for non-authenticated users -->
					{#if authChecked && !isLoggedIn && hasGuestReports}
						<GuestReportBadge />
					{/if}
					<h1 class="sm:pt-16 pt-4 text-4xl sm:text-7xl font-normal w-[100%] pb-4 sm:pb-8 leading-tight tracking-tight mx-auto text-center font-aeonik">
						What's your
						<span style="min-width: 140px;">
							<span class="single-sweep" data-text="JobPostScore">JobPost<b>Score</b>?</span>
						</span>
					</h1>
					<p class="hidden sm:block sm:text-xl text-gray-400 text-center mb-8 max-w-3xl mx-auto font-normal font-aeonik">
						Your JobPostScore reveals how visible your job is across AI-powered platforms, where more and more applicants now begin their job search. It's the fastest way to see if your job is discoverable — or disappearing in search results.
					</p>
					<p class="block sm:hidden w-[95%] text-lg sm:text-base text-gray-400 text-center mb-2 max-w-3xl mx-auto font-normal font-aeonik">See how visible your job is on AI-powered platforms where candidates start their search.</p>
					<AuditForm on:audit={handleAudit} />
				</div>
			</div>
		</div>

	</section>
	<ScrollIndicator />
</div>
