<script>
  // Import card components if needed
  import { Card, CardContent } from '$lib/components/ui/card';
  import FadeImage from '$lib/components/ui/fade-image/fade-image.svelte';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { analyzeJob, rewriteJob } from '../services/jobService'; // Hypothetical service functions

  // Feature items with descriptions and image positions
  const features = [
    {
      title: "Reads your job posts completely",
      description: "JobPostScore analyzes your job content end to end — scoring clarity, structure, and how easily it’s found by the right candidates.",
      imagePlaceholder: "Browser03.png",
      imagePosition: "top"
    },
    {
      title: "Scores your optimization level",
      description: "JobPostScore evaluates your posts against proven best practices, showing you exactly where you rank on the factors that drive visibility and applications.",
      imagePlaceholder: "Browser03.png",
      imagePosition: "top"
    },
    {
      title: "Shows you what to fix",
      description: "Just paste your job post. JobPostScore identifies what's limiting your reach and gives you the specific changes that improve your score — no guesswork.",
      imagePlaceholder: "Browser03.png",
      imagePosition: "left",
      colSpan: true
    }
  ];

  // Store for job data
  const jobData = writable({});
  const analysisResults = writable(null);
  const improvedText = writable('');

  // Function to submit job for analysis
  async function submitJob(inputType, inputData) {
    try {
      const result = await analyzeJob(inputType, inputData);
      analysisResults.set(result);
    } catch (error) {
      console.error('Error analyzing job:', error);
    }
  }

  // Function to request job rewrite
  async function requestRewrite(jobId) {
    try {
      const result = await rewriteJob(jobId);
      improvedText.set(result.improvedText);
    } catch (error) {
      console.error('Error rewriting job:', error);
    }
  }
</script>

<section class="py-12 sm:px-4 bg-white border-2 border-gray-100 rounded-2xl mb-8">
  <div class="container  px-4 sm:px-6 lg:px-8">
    <div class="text-left mb-12">
      <h2 class="text-3xl md:text-5xl mb-4 tracking-tight text-gray-900 md:w-[60%] w-full">Finally, job post optimization that actually works</h2>
      <p class="text-base text-gray-500 max-w-3xl">Your <b class="text-gray-900">JobPostScore</b> shows you what's limiting your reach and how to fix it.</p>
    </div>
    
    <!-- 2x2 grid with second row colspan-2 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each features as feature, index}
        {#if feature.colSpan}
          <div class="col-span-1 md:col-span-2">
            <Card class="border-none shadow-none">
              <CardContent class="p-6">
                <div class="flex flex-col md:flex-row items-center gap-6">
                  {#if feature.imagePosition === 'left'}
                    <div class="w-full md:w-1/3 mb-4 md:mb-0">
                      <FadeImage src={feature.imagePlaceholder} alt={feature.title} fadeDirection="bottom"
                      fadeIntensity="none" />
                    </div>
                  {/if}
                  <div class="w-full {feature.imagePosition === 'left' ? 'md:w-2/3' : ''}">
                    <h3 class="text-xl mb-2">{feature.title}</h3>
                    <p class="text-gray-500 w-full md:w-[70%] text-base text-left sm:text-left">{feature.description}</p>
                  </div>
                  {#if feature.imagePosition === 'right'}
                    <div class="w-full md:w-1/3 mt-4 md:mt-0">
                      <FadeImage src={feature.imagePlaceholder} alt={feature.title} fadeDirection="bottom"
                      fadeIntensity="none" />
                    </div>
                  {/if}
                </div>
              </CardContent>
            </Card>
          </div>
        {:else}
          <div>
            <Card class="border-none shadow-none">
              <CardContent class="p-6">
                <div class="flex flex-col">
                  {#if feature.imagePosition === 'top'}
                    <div class="mb-4">
                      <FadeImage src={feature.imagePlaceholder} alt={feature.title} fadeDirection="bottom" fadeIntensity="none" />
                    </div>
                  {/if}
                  <h3 class="text-xl mb-2">{feature.title}</h3>
                  <p class="text-gray-500 w-full md:w-[80%] text-base text-left sm:text-left">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        {/if}
      {/each}
    </div>
  </div>
</section>

<!-- Job Input Form -->
<form on:submit|preventDefault={() => submitJob('text', jobData)}>
  <textarea bind:value={$jobData.job_body} placeholder="Enter job description..."></textarea>
  <button type="submit">Analyze Job</button>
</form>

<!-- Display Analysis Results -->
{#if $analysisResults}
  <div>
    <h2>Analysis Results</h2>
    <pre>{JSON.stringify($analysisResults, null, 2)}</pre>
    <button on:click={() => requestRewrite($analysisResults.id)}>Rewrite Job</button>
  </div>
{/if}

<!-- Display Improved Job Text -->
{#if $improvedText}
  <div>
    <h2>Improved Job Text</h2>
    <pre>{$improvedText}</pre>
  </div>
{/if}

<style>
  /* Apply any custom styling here if needed */
</style>
