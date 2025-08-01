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


 // Supports weights 400-900


  
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
  <title>JobPostScore | Job Posting Audit Platform</title>
  <meta name="description" content="Transform your job postings into talent magnets with JobPostScore's job posting audit platform" />
  <meta name="keywords" content="job posting, job description, HR tools, recruitment, diversity, inclusion, hiring" />
</svelte:head>

<div class="pb-64">
<div class="bg-[url('/bkg.png')] bg-no-repeat bg-cover bg-center rounded-xl bg-opacity-100">
  
    <!-- Hero Section with Audit Form -->
    <section class="mb-4 sm:mb-8 bg-[radial-gradient(ellipse_at_center,white_0%,transparent_70%)] p-2 rounded-xl border-gray-200 border-none min-h-[400px] sm:h-[85vh] relative">
      <div class="container sm:pt-16">
        
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-8 items-center mx-auto">
          <div class="px-4 lg:px-16 pb-8 sm:pb-20 rounded-3xl min-h-[350px] sm:min-h-[680px] mx-auto pt-8 sm:pt-24">
        
            <h1 class="text-4xl sm:text-7xl font-normal w-[100%] pb-12 leading-tight tracking-tight mx-auto text-center font-aeonik ">
            <!-- Three animated words that cycle every 3 seconds -->
            <!-- <span class="word-cycle" style="min-width: 140px;">
                <span class="chroma-text text-right" data-text="Audit">Audit</span>
                <span class="chroma-text text-right" data-text="Score">Score</span>
                <span class="chroma-text text-right" data-text="Boost">Boost</span>
              </span> your job postings70% more visibility. -->
              
              What is your <span style="min-width: 140px;">
                <span class="single-sweep" data-text="JobPostScore">JobPostScore?</span>
              </span>
            </h1>
            <p class="text-base sm:text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto font-normal font-aeonik">
              Your JobPostScore is the key to connecting with the 70% of qualified candidates you're currently missing. <span class="hidden sm:inline">Audit your post, improve your visibility, and start attracting the right candidates—before your competitors do.</span>
            </p>
            <!-- <ChatAuditForm on:audit={handleAudit} /> -->
            <AuditForm on:audit={handleAudit} />
          </div>
        </div>
      </div>
    </section>
</div>
    <!-- Job Post Optimization Section -->
<!-- <JobPostOptimization /> -->

<!-- Call to Action Section -->
 <div class="pb-24">
<CallToAction 
  header='“This feels like the future of talent acquisition.”' 
  ctaText=""
  ctaButtonText="It is."
/>
</div>

<!-- <EnterpriseTalentTeams />
<ScrollTellingHowItWorks /> -->


<!-- What We Do Section -->
<WhatWeDo />

<!-- 

Three ways JobPostScore improves enterprise hiring
Executive search
JobPostScore analyzes your leadership role posts and shows you specific improvements that help these critical positions get discovered by qualified candidates.
Volume hiring
JobPostScore ensures consistent quality across hundreds of posts, helping regional recruiters maintain optimization standards without manual oversight.
Competitive positioning
JobPostScore shows you exactly how your job posts compare to market standards, revealing opportunities to stand out in competitive talent markets.

-->


<!-- <HowWeDo /> -->
<TrustQuoteCombo />
<CallToAction 
  header='“Stop guessing, start scoring.”' 
  ctaText="Discover how your job posts are really performing — and what to do to boost visibility and results."
  ctaButtonText="Get Your JobPostScore"
/>

<!-- Newsletter Signup Section -->
<!-- <div class="container my-16">
  <NewsletterSignup 
    heading="Stay Updated on JobPostScore" 
    subheading="Get the latest news and updates about our inclusive job posting tools and features."
  />
</div> -->

<!-- <LearnMoreAboutUs subtitle="WANT TO SEE MORE ABOUT US?" /> -->

<!-- Results Modal -->
<!-- <ResultsDisplay 
  results={results} 
  loading={isLoading} 
  visible={showResults} 
  on:close={handleCloseResults} 
  on:export={handleExport} 
/> -->


</div>
<style lang="scss">
  /* Gradient text effect with color transition */
  .chroma-text {
    background-image: linear-gradient(90deg, #000000 0, #000000 33.33%, #c679c4 40%, #fa3d1d 45%, #ffd700 50%, #ffffff 55%, #4da6ff 65%, transparent 66.67%, transparent); 
    background-size: 300% 100%;
    background-position: 100% 0;
    will-change: background-position;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    /* Fallback for browsers that don't support gradient text */
    @supports not (background-clip: text) {
      color: #000;
    }
  }

  /* Container for cycling words */
  .word-cycle {
    display: inline-grid; /* Stack words in same position */
    text-align: right;
    position: relative;
  }

  /* Base styles for each word in the cycle */
  .word-cycle > span {
    grid-area: 1 / 1; /* All words occupy same grid cell */
    opacity: 0;
    animation-name: word-cycle, chroma-sweep;
    animation-duration: 9s; /* Full cycle duration */
    animation-iteration-count: infinite;
  }

  /* Staggered animation delays for each word */
  .word-cycle > span:nth-child(1) { animation-delay: 0s; }
  .word-cycle > span:nth-child(2) { animation-delay: 3s; }
  .word-cycle > span:nth-child(3) { animation-delay: 6s; }

  /* Controls word visibility during 9s cycle */
  @keyframes word-cycle {
    0%, 33.32%, 100% { opacity: 0; } /* Hidden most of the time */
    3%, 30% { opacity: 1; } /* Visible for ~27% of cycle */
  }

  /* Controls gradient sweep effect during visibility */
  @keyframes chroma-sweep {
    0%, 3% {
      background-position: 100% 0; /* Start with gradient off to right */
      filter: blur(1px); /* Slightly blurred at start */
    }
    /* SLOWED DOWN: Sweep now happens between 3% and 12% */
    16% {
      background-position: 0% 0; /* Gradient fully sweeps in */
      filter: blur(0); /* Sharpens */
    }
    30% {
      background-position: 0% 0; /* Maintains gradient position */
      filter: blur(0);
    }
    30.01%, 100% {
      background-position: 100% 0; /* Resets gradient position */
      filter: blur(1px); /* Blurs again before disappearing */
    }
  }
  
  .single-sweep {
    background-image: linear-gradient(90deg, 
      #000000 0%, 
      #000000 35%, 
      #c679c4 40%, 
      #fa3d1d 42%, 
      #ffb005 44%, 
      #e1e1fe 46%, 
      #0358f7 48%, 
      #000000 50%, 
      #000000 100%);
    background-size: 800% 100%;
    background-position: 100% 0;
    will-change: background-position;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: initial;
    color: #000;
    filter: blur(0);
    animation: chroma-sweep 3s ease-in-out 4s 1 forwards;
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
