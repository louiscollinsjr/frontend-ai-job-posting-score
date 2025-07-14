<script>
  import { StackedCards } from '$lib/components/ui/stacked-cards';
  import FadeImage from '$lib/components/ui/fade-image/fade-image.svelte';

  // Feature items with icons and descriptions
  const features = [
    {
      category: "ANALYSIS",
      title: "Job Post Analysis",
      description: "We analyze your job postings for clarity, inclusivity, and effectiveness to help you attract the right talent.",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>`
    },
    {
      category: "OPTIMIZATION",
      title: "Optimization Suggestions",
      description: "Get actionable recommendations to improve your job descriptions and increase qualified applicant engagement.",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>`
    },
    {
      category: "TRACKING",
      title: "Performance Tracking",
      description: "Track improvements in your job posting effectiveness and candidate quality over time.",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>`
    }
  ];
</script>

<section class="relative py-16 bg-white border-2 border-gray-100 rounded-2xl mb-8 overflow-hidden ">
  <div class="w-full relative">
    <!-- Two-column layout with full bleed image -->  
    <div class="flex flex-col lg:flex-row">
      <!-- Left content column with padding -->  
      <div class="w-[90%] sm:w-[80%] lg:w-[80%] xl:w-[55%] px-8 md:px-8 pb-12">
        <div class="text-left mb-12">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-normal pb-8 leading-tight tracking-tight text-gray-900">We help teams craft job posts
            that introduce new levels of readability, relevance, and reach</h2>
          <p class="text-gray-500 text-left text-base w-[80%] font-normal leading-relaxed tracking-normal">Your <b>JobPostScore</b> is an intelligent job post analyzer that reads your content, scores your optimization, and shows you exactly what to fix — instantly.
          </p>
        </div>
      </div>
      
      <!-- Right column with image flush to edge -->
      <div class="w-full hidden xl:block  xl:w-[55%] relative h-[350px] lg:h-[500px] xl:h-[600px] overflow-hidden mt-8 lg:mt-0">
        <FadeImage 
          src="/job-post-score-01.png"
          alt="JobPostScore Group" 
          fadeDirection="bottom"
          fadeIntensity="strong"
          className="absolute top-0 right-0 h-full w-auto min-w-full max-w-none object-cover lg:object-right rounded-lg lg:rounded-l-lg lg:rounded-r-none"
        />
      </div>
    </div>
    
    <!-- Features section with stacked cards -->
    <!-- <StackedCards>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
      {#each features as feature}
        <div class="flex flex-col text-left">
          <div class="bg-gray-100 rounded-full p-4 mb-5 w-16 h-16 flex items-center justify-center shadow-sm">
            {@html feature.icon}
          </div>
          <p class="text-xs uppercase font-medium tracking-wider text-gray-400 mb-1">{feature.category}</p>
          <h3 class="text-xl font-medium mb-3 text-gray-900 tracking-tight">{feature.title}</h3>
          <p class="text-gray-600 text-left text-sm leading-relaxed tracking-normal">{feature.description}</p>
        </div>
      {/each}
      </div>
    </StackedCards> -->
  </div>
</section>
