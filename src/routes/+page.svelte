<script>
  import AuditForm from '$lib/components/AuditForm.svelte';
  import FeatureCard from '$lib/components/FeatureCard.svelte';
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
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
<section class="hero-section mt-4 md:mt-8 mb-16">
  <div class="container mx-auto px-4">
    <div class="text-center mb-10">
      <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        Transform your job postings into talent magnets
      </h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Help your HR department write inclusive, effective job descriptions that attract the right candidates.
      </p>
    </div>
    
    <div class="flex flex-col lg:flex-row items-center justify-center gap-8">
      <div class="w-full lg:w-1/2">
        <AuditForm on:audit={handleAudit} />
      </div>
      
      <div class="w-full lg:w-1/2 flex justify-center">
        <!-- Hero Illustration -->
        <div class="illustration-container relative w-full max-w-md">
          <img 
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Job posting audit process" 
            class="rounded-lg shadow-lg object-cover w-full h-auto"
          />
          <!-- Overlay with info -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg text-white">
            <p class="text-lg font-semibold">Get actionable insights</p>
            <p class="text-sm">Improve your job postings with AI-powered analysis</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Feature Cards Section -->
<section class="feature-cards mb-16">
  <div class="container mx-auto px-4">
    <h2 class="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">Why use ReachScore?</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each featureCards as card}
        <FeatureCard 
          title={card.title} 
          description={card.description} 
          icon={card.icon} 
        />
      {/each}
    </div>
  </div>
</section>

<!-- How It Works Section -->
<section class="how-it-works mb-16 bg-gray-100 py-12 rounded-lg">
  <div class="container mx-auto px-4">
    <h2 class="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
    
    <div class="flex flex-wrap justify-center mb-8">
      <div class="w-full md:w-10/12 lg:w-8/12">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <!-- Step 1 -->
          <div class="step text-center mb-8 md:mb-0 px-4">
            <div class="step-number bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
            <h3 class="text-xl font-semibold mb-2">Input</h3>
            <p class="text-gray-600">Paste your job posting URL or job description text</p>
          </div>
          
          <!-- Step 2 -->
          <div class="hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          <!-- Step 3 -->
          <div class="step text-center mb-8 md:mb-0 px-4">
            <div class="step-number bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
            <h3 class="text-xl font-semibold mb-2">Analyze</h3>
            <p class="text-gray-600">Our AI evaluates inclusivity, clarity, and effectiveness</p>
          </div>
          
          <!-- Step 4 -->
          <div class="hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          <!-- Step 5 -->
          <div class="step text-center px-4">
            <div class="step-number bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
            <h3 class="text-xl font-semibold mb-2">Improve</h3>
            <p class="text-gray-600">Get actionable recommendations to enhance your job posting</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="text-center">
      <a href="/how-it-works" class="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
        Learn more about our analysis process
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
</section>

<!-- Results Modal -->
<ResultsDisplay 
  results={results} 
  loading={isLoading} 
  visible={showResults} 
  on:close={handleCloseResults} 
  on:export={handleExport} 
/>
