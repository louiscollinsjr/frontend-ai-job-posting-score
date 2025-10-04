<script lang="ts">
	import WhatWeDo from '$lib/components/WhatWeDo.svelte';
	import CallToAction from '$lib/components/CallToAction.svelte';
	import { auditStore } from '$lib/stores/audit.js';
	import { user } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import AuditForm from '$lib/components/AuditForm.svelte';
	import BetaBadge from '$lib/components/BetaBadge.svelte';
	import TestimonialCarousel from '$lib/components/TestimonialCarousel.svelte';
	import RefinedGrid from '$lib/components/RefinedGrid.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';
	import GuestReportBadge from '$lib/components/GuestReportBadge.svelte';
	import { GuestReportsAPI } from '$lib/api/reports';
	import MessageNotification from '$lib/components/MessageNotification.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import HomePageSections from '$lib/components/HomePageSections.svelte';
	import Section from '$lib/components/Section.svelte';
	import RefinedGridV2 from '$lib/components/RefinedGridV2.svelte';
	import LearnMore from '$lib/components/LearnMore.svelte';
	import HowMyJobPostScore from '$lib/components/HowMyJobPostScore.svelte';
	import type { AuditResponse } from '$lib/stores/audit';

	// Supports weights 400-900

	// Store subscription
	let isLoading = false;
	let results: AuditResponse | null = null;
	let showResults = false;
	

	// Message handling
	let showMessage = false;
	let messageText = '';
	let messageType = 'info';

	// Authentication status for guest badge
	let isLoggedIn = false;
	let hasGuestReports = false;
	let authChecked = false;
	let showLearnMore = true;

	// Subscribe to the store on mount (client-only)

	// Handle audit form submission
	function handleAudit(event: CustomEvent) {
		const { type, data, results } = event.detail;

		// If results are already provided by the component, use them directly
		if (results) {
			auditStore.update((state) => ({
				...state,
				results,
				showResults: true,
				isLoading: false
			}));
		} else {
			// Otherwise use the store's submitAudit method
			auditStore.submitAudit(type, data);
		}
	}

	// Handle closing results modal
	function handleCloseResults() {
		auditStore.toggleResults(false);
	}

	// Handle export request
	async function handleExport(event: CustomEvent) {
		const { format } = event.detail;
		if (results) {
			try {
				const { exportResults } = await import('$lib/api/audit.js');
				await exportResults(results, format);
			} catch (error) {
				console.error('Export failed:', error);
				alert('Export failed. Please try again.');
			}
		}
	}

	// Handle message dismissal
	function dismissMessage() {
		showMessage = false;
	}

	// Subscribe and cleanup on component mount/unmount
	onMount(() => {
		const unsubscribe = auditStore.subscribe((state) => {
			isLoading = state.isLoading;
			results = state.results;
			showResults = state.showResults;
		});

		// Subscribe to user authentication state
		const unsubscribeUser = user.subscribe((currentUser) => {
			isLoggedIn = !!currentUser?.id;
			authChecked = true;
		});

		// Check for guest reports
		if (browser) {
			try {
				const currentReport = GuestReportsAPI.load();
				const history = GuestReportsAPI.getHistory();

				// Validate current report has meaningful data
				const validCurrentReport =
					currentReport && (currentReport.job_title || currentReport.job_body);

				hasGuestReports = !!(validCurrentReport || history.length > 0);

				if (import.meta.env.DEV) {
					console.log('[HomePage] Current report exists:', !!currentReport);
					console.log('[HomePage] Current report valid:', !!validCurrentReport);
					console.log('[HomePage] History count:', history.length);
					console.log('[HomePage] hasGuestReports:', hasGuestReports);
				}
			} catch (error) {
				console.warn('Error checking guest reports:', error);
				hasGuestReports = false;
			}
		}

		// Check for URL messages
		const unsubscribePage = page.subscribe(($page) => {
			if (browser) {
				const msg = $page.url.searchParams.get('msg');
				if (msg === 'no-reports') {
					showMessage = true;
					messageText =
						"You don't have any cached reports yet. Analyze a job posting to get started!";
					messageType = 'info';

					// Auto-dismiss after 5 seconds
					setTimeout(() => {
						showMessage = false;
					}, 5000);
				}
			}
		});

		return () => {
			unsubscribe();
			unsubscribeUser();
			unsubscribePage();
		};
	});
</script>

<svelte:head>
	<title>JobPostScore | Optimize Your Job Postings for Better Hiring</title>
	<meta
		name="description"
		content="Boost recruitment success with JobPostScore. Audit, score, and optimize your job postings to attract top talent, improve diversity, and streamline hiring." />
	<meta
		name="keywords"
		content="job posting audit, job description optimization, recruitment tools, HR software, hiring insights, diversity and inclusion, talent acquisition" />

	<!-- Open Graph -->
	<meta property="og:title" content="JobPostScore | Optimize Your Job Postings for Better Hiring" />
	<meta
		property="og:description"
		content="Audit and improve your job postings to attract top candidates and foster diverse, inclusive hiring with JobPostScore." />
	<meta property="og:type" content="website" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div id="hero" class="bg-transparent relative mx-0 sm:mx-auto pb-10 sm:pb-64 pt-6">
	<!-- Message Notification -->
	<MessageNotification {showMessage} {messageText} {messageType} on:dismiss={dismissMessage} />

	<!-- Hero Section -->
	<HeroSection {isLoggedIn} {hasGuestReports} {authChecked} on:audit={handleAudit} />

	<!-- Beta Badge Section -->
	<Section>
		<BetaBadge />
	</Section>
	{#if showLearnMore}
		<Section containerClass="container mx-auto mt-24">
			<LearnMore
				eyebrow=""
				title=""
				description=""
				ctaLabel="Learn More"
				destination="/learn-more"
				heightClass="min-h-[760px]"
				backgroundClass="bg-gradient-to-bl from-blue-700 via-blue-600 to-blue-500"
				overlayClass="bg-gradient-to-bl from-[#f8f8f8dc]/0 via-[#ffe417]/10 to-[#0358f7]/0"
				backgroundVideo="/videos/new.mp4"
				backgroundPlaybackRate={0.5}
				on:close={() => (showLearnMore = false)}>
				<svelte:fragment slot="header">
					<div class="flex flex-col items-center gap-4 text-center font-aeonik">
						<div class="flex items-center gap-3 text-white">
							<span class="text-4xl tracking-[0.05em] text-white/100"></span>
							<Logo variant="white" imgClass="h-8 w-auto" />
						</div>
						<!-- <p class="text-xs uppercase tracking-[0.28em] text-white/70">What We Stand For</p> -->
						<h2 class="text-2xl font-aeonik tracking-wide sm:text-5xl">We help teams create job postings built for the AI-driven hiring era.</h2>
						<p class="text-lg text-white/100 sm:text-2xl mt-3">
							Make every job post discoverable, clear, and compliant.
						</p>
					</div>
				</svelte:fragment>
			</LearnMore>
		</Section>
	{/if}
	

	<!-- What We Do Section -->
	<!-- <Section containerClass="z-10">
		<WhatWeDo />
	</Section> -->

	<!-- Call To Action Section -->
	<Section containerClass="-my-14">
		<CallToAction
			header="Instantly Scored. Visibility Tested."
			ctaText=""
			ctaButtonText="Optimize Job Post Now"
			ctaBackground="bg-[#ffffff]"
			scrollTo="#hero" />
	</Section>

	<!-- Refined Grid Section -->
	<Section containerClass="">
		<!-- <RefinedGrid /> -->
		<RefinedGridV2 />
	</Section>

	<!-- Call To Action Section -->
	<Section containerClass="">
		<CallToAction
			header="Measure performance, uncover gaps, and boost visibility instantly."
			ctaText="Discover how your job posts are really performing — and what to do to boost visibility and results."
			ctaBackground="bg-[#f8f8f8]"
			scrollTo="#hero">
			<svelte:fragment slot="button">
				<Logo variant="white" imgClass="sm:h-6 h-5 w-auto mr-0" />
			</svelte:fragment>
		</CallToAction>
	</Section>

	<div class="container mx-auto z-10"><HowMyJobPostScore /></div>

	<!-- <div class="container mx-auto z-10"></div> -->

	<div class="mx-auto sm:mt-64 my-32">
		<TestimonialCarousel />
	</div>

	<Section containerClass="container mx-auto mt-64">
		<CallToAction
			header="Ready to transform your job postings?"
			ctaText="Get started with JobPostScore today and start attracting the right candidates."
			ctaButtonText="Get Started"
			ctaBackground="bg-[#f8f8f8]"
			scrollTo="#hero" />
	</Section>
</div>

<div class="container mx-auto text-center my-2 mb-12 text-xs text-gray-400">
	<BetaBadge />
</div>

<style lang="scss">
</style>
