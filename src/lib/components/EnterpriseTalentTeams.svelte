<script>
  import FadeImage from '$lib/components/ui/fade-image/fade-image.svelte';

  // Enterprise features with descriptions
  const enterpriseFeatures = [
    {
      title: "No optimization expertise needed",
      description: "No manual research. No trial and error.",

    },
    {
      title: "Doesn't require training",
      description: "ReachScore analyzes posts automatically — your team gets actionable insights without learning complex SEO or optimization rules.",

    },
    {
      title: "Invisible complexity",
      description: "ReachScore handles technical analysis behind the scenes. You see clear scores and simple fixes, not complicated recommendations.",

    },
    {
      title: "Follows your brand voice",
      description: "ReachScore optimizes for performance while maintaining your company's authentic tone and employer brand.",
    }
  ];

  // Browser images for alternating sections
  const browserImages = [
    "/Browser01.png",
    "/Browser02.png",
    "/Browser03.png"
  ];
</script>

<section class="relative p-8 py-24 border-0 border-gray-100 rounded-2xl mb-8 overflow-hidden bg-blue-50">
  <div class="w-full relative">
    <!-- Headline Section -->
    <div class="flex flex-col lg:flex-row mb-24">
      <!-- Left content column with padding -->
      <div class="w-[90%] sm:w-[80%] lg:w-[80%] xl:w-[55%] px-8 md:px-8 pb-12">
        <div class="text-left mb-12">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-normal pb-8 leading-tight tracking-tight text-gray-900">
            Built for enterprise talent teams
          </h2>
          <p class="text-gray-500 text-left text-base w-[80%] font-normal leading-relaxed tracking-normal">
            <b>ReachScore</b> is designed specifically for enterprise talent acquisition teams that need powerful optimization without the complexity.
          </p>
        </div>
      </div>
      
      <!-- Right column with image flush to edge -->
      <div class="w-full hidden xl:block xl:w-[55%] relative h-[350px] lg:h-[500px] xl:h-[500px] overflow-hidden mt-8 lg:mt-0">
        <FadeImage 
          src={browserImages[0]}
          alt="Enterprise Platform" 
          fadeDirection="bottom"
          fadeIntensity="strong"
          className="absolute top-0 right-0 h-full w-auto min-w-full max-w-none object-cover lg:object-right rounded-lg lg:rounded-l-lg lg:rounded-r-none"
        />
      </div>
    </div>

    <!-- First Feature Section (Image Left, Content Right) -->
    <div class="flex flex-col-reverse lg:flex-row mb-32">
      <!-- Left image column -->
      <div class="w-full hidden xl:block xl:w-[55%] relative h-[350px] lg:h-[400px] overflow-hidden mt-8 lg:mt-0">
        <FadeImage 
          src={browserImages[1]}
          alt="No Training Required" 
          fadeDirection="bottom"
          fadeIntensity="medium"
          className="absolute top-0 left-0 h-full w-auto min-w-full max-w-none object-cover lg:object-left rounded-lg lg:rounded-r-lg lg:rounded-l-none"
        />
      </div>
      
      <!-- Right content column -->
      <div class="w-[90%] sm:w-[80%] lg:w-[80%] xl:w-[45%] px-8 md:px-8">
        <div class="flex flex-col text-left py-6 w-[80%]">

          <h3 class="text-2xl font-medium mb-3 text-gray-900 tracking-tight">{enterpriseFeatures[0].title}</h3>
          <p class="text-gray-600 text-left text-base leading-relaxed tracking-normal">{enterpriseFeatures[0].description}</p>
        </div>

        <div class="flex flex-col text-left mt-12 w-[78%]">

          <h3 class="text-2xl font-medium mb-3 text-gray-900 tracking-tight">{enterpriseFeatures[1].title}</h3>
          <p class="text-gray-600 text-left text-base leading-relaxed tracking-normal">{enterpriseFeatures[1].description}</p>
        </div>
      </div>
    </div>

    <!-- Second Feature Section (Content Left, Image Right) -->
    <div class="flex flex-col lg:flex-row">
      <!-- Left content column -->
      <div class="w-[90%] sm:w-[80%] lg:w-[80%] xl:w-[45%] px-8 md:px-8">
        <div class="flex flex-col text-left py-6 w-[80%]">

          <h3 class="text-2xl font-medium mb-3 text-gray-900 tracking-tight">{enterpriseFeatures[2].title}</h3>
          <p class="text-gray-600 text-left text-base leading-relaxed tracking-normal">{enterpriseFeatures[2].description}</p>
        </div>

        <div class="flex flex-col text-left mt-12 w-[80%]">

          <h3 class="text-2xl font-medium mb-3 text-gray-900 tracking-tight">{enterpriseFeatures[3].title}</h3>
          <p class="text-gray-600 text-left text-base leading-relaxed tracking-normal">{enterpriseFeatures[3].description}</p>
        </div>
      </div>
      
      <!-- Right image column -->
      <div class="w-full hidden xl:block xl:w-[55%] relative h-[350px] lg:h-[400px] overflow-hidden mt-8 lg:mt-0">
        <FadeImage 
          src={browserImages[2]}
          alt="Invisible Complexity" 
          fadeDirection="bottom"
          fadeIntensity="medium"
          className="absolute top-0 right-0 h-full w-auto min-w-full max-w-none object-cover lg:object-right rounded-lg lg:rounded-l-lg lg:rounded-r-none"
        />
      </div>
    </div>
  </div>
</section>
