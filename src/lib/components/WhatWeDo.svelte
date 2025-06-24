<script>
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

<section class="py-16 bg-white border-2 border-gray-100 rounded-2xl mb-8">
  <div class="container">
    <div class="text-left mb-12 px-16">
      <h2 class="text-5xl font-normal w-1/2 pb-24 leading-tight tracking-tight text-gray-900">We help teams craft job posts
        that introduce new levels of readability, relevance, and reach</h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-16">
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
  </div>
</section>
