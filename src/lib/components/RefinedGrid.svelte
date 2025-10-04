<script>
    import Card_EveryWordMatters from '$lib/components/landing_cards/Card_EveryWordMatters.svelte';
    import Card_KnowExactlyWhereYouStand from '$lib/components/landing_cards/Card_KnowExactlyWhereYouStand.svelte';
    import Card_NoGuessWork from '$lib/components/landing_cards/Card_NoGuessWork.svelte';
    import Card_BeFound from '$lib/components/landing_cards/Card_BeFound.svelte';
    import Card_MeasureOverTime from '$lib/components/landing_cards/Card_MeasureOverTime.svelte';
  
    const features = [
      {
        component: Card_EveryWordMatters,
        title: 'Every Word Counts',
        text: `Copy and paste or attach your job listing into JobPostScore. We review it completely then evaluates for clarity, structure, and discoverability.`,
        background: '/card_backgrounds/bg6.png'
      },
      {
        component: Card_KnowExactlyWhereYouStand,
        title: 'Know Exactly Where You Stand',
        text: `JobPostScore evaluates your listing against proven best practices and shows your optimization level, so you immediately know which areas need improvement.`,
        background: '/card_backgrounds/bg7.png'
      },
      {
        component: Card_NoGuessWork,
        title: 'No Guesswork, Just Action',
        text: `JobPostScore highlights what’s limiting your reach and gives specific recommendations to improve every factor that drives AI visibility and candidate applications.`,
        background: '/card_backgrounds/bg8.png'
      },
      {
        component: Card_BeFound,
        title: 'Be Found Where Candidates Search',
        text: `Your job is optimized for AI-driven platforms like ChatGPT, Gemini, and other AI job-matching tools, ensuring more qualified candidates see it.`,
        background: '/card_backgrounds/bg4.webp'
      },
      {
        component: Card_MeasureOverTime,
        title: 'Measure Your Impact Over Time',
        text: `Monitor your JobPostScore as you make changes, track improvements, and see how AI discoverability and candidate applications increase.`,
        background: '/card_backgrounds/bg5.webp'
      },
    ];
  </script>
  
    <section class="relative p-0 bg-[#FCFDFC] border-2 border-[#f8f8f8] border-b-white border-x-0 rounded-2xl mb-8 overflow-hidden font-aeonik bg-[url('/mobile_bkg_base_white.png')] sm:bg-[url('/bkg_white.png')] bg-no-repeat bg-right-center sm:bg-cover">
      <div class="w-full relative sm:px-8 sm:py-20">
    <!-- <div class="mx-auto max-w-7xl px-8"> -->
      <!-- Header Text -->
      <div class="text-left">
        <!-- <h2 class="text-lg text-blue-400 font-aeonik">Your job post, refined for maximum visibility.</h2> -->
        <p class="text-3xl md:text-5xl text-black sm:font-normal font-aeonik my-0  max-w-3xl px-8 pt-10">
          Job Postings, reimagined for the AI search era.
        </p>
        <p class="text-base sm:text-lg text-gray-500 max-w-2xl font-aeonik mb-12 p-8 pl-8">Your <b class="text-gray-900">JobPostScore</b> reveals how easily candidates discover your role in today’s AI-driven job search, highlights visibility gaps, and guides you on how to improve.</p>
      </div>
  
      <!-- Features Grid -->
      <div class="mt-0 flex justify-center w-full">
        <div class="flex flex-wrap justify-center sm:gap-20 gap-0 sm:gap-y-20 gap-y-12 w-full">
          {#each features as feature}
            <div class="flex flex-col w-full max-w-[400px] gap-y-0">
              <!-- Card Component -->
              <div class="h-full sm:h-[450px]"> <!-- Set a fixed height for all cards -->
                <svelte:component 
                  this={feature.component} 
                  title={feature.title} 
                  text={feature.text} 
                  background={feature.background} 
                />
              </div>
  
              <!-- Description Text -->
              <div class="mx-4 mt-4 text-left lg:text-left font-aeonik">
                <div class="p-2">
                  <span class="text-base sm:text-base text-gray-700 leading-tight font-normal tracking-normal">
                    <span class="font-bold">{feature.title}</span> {feature.text}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>