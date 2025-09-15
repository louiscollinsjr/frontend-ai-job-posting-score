<script>
  // Import card components if needed
  import { Card, CardContent } from '$lib/components/ui/card';
  import FadeImage from '$lib/components/ui/fade-image/fade-image.svelte';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import CircularProgress from '$lib/components/CircularProgress.svelte';
  import { fade } from 'svelte/transition';

  // Feature items with descriptions and image positions
  const features = [
    {
      title: "Every word matters.",
      description: "JobPostScore checks clarity, structure, and discoverability—so your job gets seen by the candidates.",
      imagePlaceholder: "Browser03.png",
      imagePosition: "top"
    },
    {
      title: "Scores your optimization level",
      description: "JobPostScore evaluates your posts against proven best practices, showing you exactly where you rank on the factors that drive visibility and applications.",
      imagePlaceholder: "Browser03.png",
      imagePosition: "top",
      // component: CircularProgress,
      // props: { value: 99, size: 200, strokeWidth: 8, duration: 1500 }
    },
    {
      title: "Shows you what to fix",
      description: "Just paste your job post. JobPostScore identifies what's limiting your reach and gives you the specific changes that improve your score — no guesswork.",
      imagePlaceholder: "Browser03.png",
      imagePosition: "left",
      colSpan: true
    }
  ];

</script>

<div class="decorative-border sm:mb-48 mb-16">
  <div class="decorative-content">
    <section class="relative sm:py-4 py-8 border-b-0 bg-gradient-to-b from-blue-100 via-gray-50 to-transparent border-t-gray-100 border-b-transparent rounded-2xl overflow-hidden font-aeonik">
  <div class="container relative px-4 sm:px-6 lg:px-8">
    <div class="text-left mb-12 w-[100%] sm:py-16 py-2 px-8 md:px-8 pb-0 font-aeonik">
      <h2 class="text-3xl md:text-5xl mb-4 tracking-tight text-gray-900 md:w-[50%] w-full">Job Postings, reimagined for the AI search era.</h2>
      <p class="text-base text-gray-500 max-w-2xl font-aeonik">Your <b class="text-gray-900">JobPostScore</b> reveals how easily candidates discover your role in today’s AI-driven job search, highlights visibility gaps, and guides you on how to improve.</p>
    </div>
  </div>
    </section>
  </div>
</div>


<style>
  
  
</style>
