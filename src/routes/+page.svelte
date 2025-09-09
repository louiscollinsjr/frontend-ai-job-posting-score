<script>  
	import ChatAuditForm from '$lib/components/ChatAuditForm.svelte';
	import FeatureCard from '$lib/components/FeatureCard.svelte';
	import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
	import WhatWeDo from '$lib/components/WhatWeDo.svelte';
	import HowWeDo from '$lib/components/HowWeDo.svelte';
	import LearnMoreAboutUs from '$lib/components/LearnMoreAboutUs.svelte';
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
	import JobPostOptimization from '$lib/components/JobPostOptimization.svelte';
	import CallToAction from '$lib/components/CallToAction.svelte';
	import ScrollTellingHowItWorks from '$lib/components/ScrollTellingHowItWorks.svelte';
	import { auditStore } from '$lib/stores/audit.js';
	import { onMount } from 'svelte';
	import AuditForm from '$lib/components/AuditForm.svelte';
	import EnterpriseTalentTeams from '$lib/components/EnterpriseTalentTeams.svelte';
	import TrustQuoteCombo from '$lib/components/TrustQuoteCombo.svelte';
	import BetaBadge from '$lib/components/BetaBadge.svelte';
	import TestimonialCarousel from '$lib/components/TestimonialCarousel.svelte';
	import HowItWorks from '$lib/components/HowItWorks.svelte';
	import Refinedgrid from '$lib/components/Refinedgrid.svelte';
	// Supports weights 400-900 

	// Store subscription
	let isLoading = false;
	let results = null;
	let showResults = false;

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

	// Subscribe and cleanup on component mount/unmount
	onMount(() => {
		const unsubscribe = auditStore.subscribe((state) => {
			isLoading = state.isLoading;
			results = state.results;
			showResults = state.showResults;
		});
		return () => {
			unsubscribe();
		};
	});

	// Feature card data
	const featureCards = [
		{
			title: 'Inclusivity Analysis',
			description:
				'Detect and eliminate biased language to create job descriptions that appeal to a diverse talent pool.',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>'
		},
		{
			title: 'Clarity Assessment',
			description:
				'Improve readability and ensure your job requirements are clearly defined for better candidate understanding.',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
		},
		{
			title: 'Effectiveness Score',
			description:
				'Get actionable insights to optimize your job postings for better candidate attraction and higher quality applicants.',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
		}
	];
</script>

<svelte:head>
	<title>JobPostScore | Job Posting Audit Platform</title>
	<meta
		name="description"
		content="Transform your job postings into talent magnets with JobPostScore's job posting audit platform"
	/>
	<meta
		name="keywords"
		content="job posting, job description, HR tools, recruitment, diversity, inclusion, hiring"
	/>
</svelte:head>

<div id="hero" class="bg-transparent relative mx-auto pb-10 sm:pb-64 pt-6">
  	<!-- Background elements -->
  	<!-- <div class="absolute inset-0 bg-[url('/bkg2.png')] bg-no-repeat bg-contain sm:bg-cover bg-center blur-lg opacity-90 z-0"></div>
  	<div class="absolute inset-0 bg-gradient-to-b from-[#f8f8f8]/0 via-[#f8f8f8]/0 to-[#f8f8f8]/0 2xl:from-[#f8f8f8]/0 2xl:via-[#f8f8f8]/0 2xl:to-[#f8f8f8]/0 z-0"></div>
  	 -->
	<div class="relative w-full min-h-[75vh] sm:min-h-[85vh] pb-8 sm:pb-24">
		
		<!-- Hero Section with Audit Form -->
		<section class="mb-4 sm:mb-8 bg-[radial-gradient(ellipse_at_center,_#f8f8f8_0%,_transparent_70%)] p-2 min-h-[70vh] sm:min-h-[85vh] relative">
			<div class="container mx-auto pt-8 sm:pt-16">
				<div class="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start mx-auto">
					<div class="px-4 lg:px-16 pb-10 sm:pb-24 rounded-3xl min-h-0 sm:min-h-[680px] mx-auto pt-6 sm:pt-20 w-full">
						<h1 class="sm:pt-16 pt-4 text-3xl sm:text-7xl font-normal w-[100%] pb-6 sm:pb-12 leading-tight tracking-tight mx-auto text-center font-aeonik">
							What is your
							<span style="min-width: 140px;">
								<span class="single-sweep" data-text="JobPostScore">JobPost<b>Score</b>?</span>
							</span>
						</h1>
						<p
							class="text-base sm:text-xl text-gray-400 text-center mb-8 max-w-3xl mx-auto font-normal font-aeonik"
						>
						Your JobPostScore reveals how visible your job is across AI-powered platforms, where more and more applicants now begin their job search. 
						<span class="hidden sm:inline"
								>Audit your post, improve your visibility, and start attracting the right
								candidates—before your competitors do.</span
							>
						</p>
						<!-- <ChatAuditForm on:audit={handleAudit} /> -->
						<AuditForm on:audit={handleAudit} />
					</div>
				</div>
			</div>
		</section>
	</div>
	<!-- Job Post Optimization Section -->
	
	<!--  -->


	<div class="container mx-auto z-10">
		<BetaBadge />
		<div class="my-24"> <JobPostOptimization /></div>
		<!-- Call to Action Section -->
		<div class="pb-2">
			<CallToAction
				header='"This feels like the future of talent acquisition."'
				ctaText=""
				ctaButtonText="It is."
				ctaBackground="bg-[#ffffff]"
				scrollTo="#hero"
			/>
		</div>

		<!-- <ScrollTellingHowItWorks />  -->
        <!-- <HowItWorks />	 -->
		 <Refinedgrid /> 

		<div class="container max-w-8xl mx-auto">
		<WhatWeDo />
		</div>

		<BetaBadge />
		<div class="container mx-auto sm:mt-48 mt-24">
			<CallToAction
			header="Stop guessing, start scoring."
			ctaText="Discover how your job posts are really performing — and what to do to boost visibility and results."
			ctaButtonText="Get JobPostScore"
			ctaBackground="bg-[#f8f8f8]"
			scrollTo="#hero"
		/>
		</div>
		
</div>
<div class="mx-auto sm:mt-64">
	<TestimonialCarousel />
</div>		

<div class="container mx-auto">
	<CallToAction
		header="Ready to transform your job postings?"
		ctaText="Get started with JobPostScore today and start attracting the right candidates."
		ctaButtonText="Get Started"
		ctaBackground="bg-[#f8f8f8]"
		scrollTo="#hero"
		/>
	</div>
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
		-webkit-text-fill-color: initial;
		color: #000;
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
