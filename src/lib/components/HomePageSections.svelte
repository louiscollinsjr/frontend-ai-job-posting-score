<script>
	import BetaBadge from '$lib/components/BetaBadge.svelte';
	import WhatWeDo from '$lib/components/WhatWeDo.svelte';
	import CallToAction from '$lib/components/CallToAction.svelte';
	import RefinedGrid from '$lib/components/RefinedGrid.svelte';
	import TestimonialCarousel from '$lib/components/TestimonialCarousel.svelte';
	import Logo from '$lib/components/Logo.svelte';
</script>

<div class="container mx-auto z-10 sm:my-24 my-16 sm:mt-32"><BetaBadge /></div>
<div class="container max-w-8xl mx-auto"><WhatWeDo /></div>

<div class="pb-2 my-24">
	<CallToAction
		header="Instantly Scored. Visibility Tested."
		ctaText=""
		ctaButtonText="Your job post, refined for maximum visibility."
		ctaBackground="bg-[#ffffff]"
		scrollTo="#hero"
	/>
</div>

<div class="container max-w-8xl mx-auto"><RefinedGrid /></div>

<div class="container mx-auto sm:mt-48 mt-0">
	<CallToAction
		header="Measure performance, uncover gaps, and boost visibility instantly."
		ctaText="Discover how your job posts are really performing — and what to do to boost visibility and results."
		ctaBackground="bg-[#ffffff]"
		scrollTo="#hero"
	>
		<svelte:fragment slot="button">
			<Logo variant="white" imgClass="h-4 w-auto mr-2" />
		</svelte:fragment>
	</CallToAction>
</div>

<div class="mx-auto sm:mt-64 my-32">
	<TestimonialCarousel />
</div>

<div class="container mx-auto mt-64">
	<CallToAction
		header="Ready to transform your job postings?"
		ctaText="Get started with JobPostScore today and start attracting the right candidates."
		ctaButtonText="Get Started"
		ctaBackground="bg-[#f8f8f8]"
		scrollTo="#hero"
	/>
</div>
