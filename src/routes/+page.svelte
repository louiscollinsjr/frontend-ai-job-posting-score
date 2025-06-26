<script>
  import ChatAuditForm from '$lib/components/ChatAuditForm.svelte';
  import FeatureCard from '$lib/components/FeatureCard.svelte';
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import WhatWeDo from '$lib/components/WhatWeDo.svelte';
  import HowWeDo from '$lib/components/HowWeDo.svelte';
  import LearnMoreAboutUs from '$lib/components/LearnMoreAboutUs.svelte';
  import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
  import { auditStore } from '$lib/stores/audit.js';
  import { onMount } from 'svelte';
  
  // Store subscription
  let isLoading = false;
  let results = null;
  let showResults = false;
  
  // Subscribe to the store
  const unsubscribe = auditStore.subscribe(state => {
    isLoading = state.isLoading;
    results = state.results;
    showResults = state.showResults;
  });
  
  // Handle audit form submission
  function handleAudit(event) {
    const { type, data, results } = event.detail;
    
    // If results are already provided by the component, use them directly
    if (results) {
      auditStore.update(state => ({
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
  
  // Clean up subscription on component unmount
  onMount(() => {
    return unsubscribe;
  });
  
  // Feature card data
  const featureCards = [
    {
      title: 'Inclusivity Analysis',
      description: 'Detect and eliminate biased language to create job descriptions that appeal to a diverse talent pool.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>'
    },
    {
      title: 'Clarity Assessment',
      description: 'Improve readability and ensure your job requirements are clearly defined for better candidate understanding.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
    },
    {
      title: 'Effectiveness Score',
      description: 'Get actionable insights to optimize your job postings for better candidate attraction and higher quality applicants.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
    }
  ];
</script>

<svelte:head>
  <title>ReachScore | Job Posting Audit Platform</title>
  <meta name="description" content="Transform your job postings into talent magnets with ReachScore's job posting audit platform" />
  <meta name="keywords" content="job posting, job description, HR tools, recruitment, diversity, inclusion, hiring" />
</svelte:head>

<!-- Hero Section with Audit Form -->
<section class="mb-8">
  <div class="container">
    <div class="grid grid-cols-1 lg:grid-cols-1 gap-8 items-center">
      <div class="bg-gray-1000 px-16 lg:px-16 py-6 rounded-3xl min-h-[580px]">
        <h1 class="text-4xl md:text-6xl font-black text-gray-900 mb-6 text-center leading-[1.1] font-normal">
          Your job post deserves to be seen
        </h1>
        <p class="text-sm text-gray-600 text-center leading-relaxed mb-24">
          ReachScore analyzes and optimizes every line — so you attract the right talent, faster.
        </p>
        <ChatAuditForm on:audit={handleAudit} />
      </div>
      
     
    </div>
  </div>
</section>

<!-- What We Do Section -->
<WhatWeDo />


<HowWeDo />

<!-- Newsletter Signup Section -->
<div class="container my-16">
  <NewsletterSignup 
    heading="Stay Updated on ReachScore" 
    subheading="Get the latest news and updates about our inclusive job posting tools and features."
  />
</div>

<LearnMoreAboutUs subtitle="WANT TO SEE MORE ABOUT US?" />

<!-- Results Modal -->
<!-- <ResultsDisplay 
  results={results} 
  loading={isLoading} 
  visible={showResults} 
  on:close={handleCloseResults} 
  on:export={handleExport} 
/> -->
