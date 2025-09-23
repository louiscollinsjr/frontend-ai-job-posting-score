<script>
	import WhatWeDo from '$lib/components/WhatWeDo.svelte';
	import CallToAction from '$lib/components/CallToAction.svelte';
	import { auditStore } from '$lib/stores/audit.js';
	import { user } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
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

	// Supports weights 400-900

	// Store subscription
	let isLoading = false;
	let results = null;
	let showResults = false;

	// Message handling
	let showMessage = false;
	let messageText = '';
	let messageType = 'info';

	// Authentication status for guest badge
	let isLoggedIn = false;
	let hasGuestReports = false;

	// Subscribe to the store on mount (client-only)

	// Handle audit form submission
	function handleAudit(event) {
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
	async function handleExport(event) {
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
	<HeroSection {isLoggedIn} {hasGuestReports} on:audit={handleAudit} />

	<!-- Beta Badge Section -->
	<Section>
		<BetaBadge />
	</Section>

	<!-- What We Do Section -->
	<Section containerClass="z-10">
		<WhatWeDo />
	</Section>

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
		<RefinedGrid />
	</Section>

	<div class="container mx-auto sm:mt-48 mt-0">
		<CallToAction
			header="Measure performance, uncover gaps, and boost visibility instantly."
			ctaText="Discover how your job posts are really performing — and what to do to boost visibility and results."
			ctaBackground="bg-[#ffffff]"
			scrollTo="#hero">
			<svelte:fragment slot="button">
				<Logo variant="white" class="h-4 w-auto mr-2" />
			</svelte:fragment>
		</CallToAction>
	</div>

	<!-- <div class="container mx-auto z-10"></div> -->

	<div class="mx-auto sm:mt-64 my-32">
		<TestimonialCarousel />
	</div>

	<div class="container mx-auto mt-64">
		<CallToAction
			header="Ready to transform your job postings?"
			ctaText="Get started with JobPostScore today and start attracting the right candidates."
			ctaButtonText="Get Started"
			ctaBackground="bg-[#f8f8f8]"
			scrollTo="#hero" />
	</div>
</div>

<div class="container mx-auto text-center my-2 mb-12 text-xs text-gray-400">
	<BetaBadge />
</div>

<style lang="scss">
	.single-sweep {
		background-image: linear-gradient(
			90deg,
			#000000 0%,
			#000000 35%,
			#c679c4 40%,
			#fa3d1d 42%,
			#ffb005 44%,
			#e1e1fe 46%,
			#0358f7 48%,
			#000000 50%,
			#000000 100%
		);
		background-size: 800% 100%;
		background-position: 100% 0;
		will-change: background-position;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		filter: blur(0);
		animation: chroma-sweep 2s ease-in-out 3s 1 forwards;
		@supports not (background-clip: text) {
			color: #000;
		}
	}

	@keyframes chroma-sweep {
		0% {
			-webkit-text-fill-color: initial;
			background-position: 100% 0;
			filter: blur(0);
		}
		100% {
			-webkit-text-fill-color: transparent;
			background-position: 0 0;
			filter: blur(0);
		}
	}
</style>
