<script>
    import CardA_Meeting from '$lib/components/CardA_Meeting.svelte';
    import CardB_Code from '$lib/components/CardB_Code.svelte';
    import CardC_Video from '$lib/components/CardC_Video.svelte';
    import Card_EveryWordMatters from '$lib/components/Card_EveryWordMatters.svelte';
    import Card_KnowExactlyWhereYouStand from '$lib/components/Card_KnowExactlyWhereYouStand.svelte';
    import Card_Blank from '$lib/components/Card_Blank.svelte';
    import Card_NoGuessWork from '$lib/components/Card_NoGuessWork.svelte';
    import Card_BeFound from '$lib/components/Card_BeFound.svelte';
    import Card_MeasureOverTime from '$lib/components/Card_MeasureOverTime.svelte';
  
    const features = [
      {
        component: Card_EveryWordMatters,
        title: 'Every Word Counts',
        text: `Paste your job post into JobPostScore. Instantly see how clear, structured, and discoverable it really is.`,
        background: '/card_backgrounds/bg6.png'
      },
      {
        component: Card_KnowExactlyWhereYouStand,
        title: 'Know Your Score',
        text: `Get a score based on proven best practices — and know exactly which parts of your job post need work.`,
        background: '/card_backgrounds/bg7.png'
      },
      {
        component: Card_NoGuessWork,
        title: 'Fix What Matters',
        text: `See what’s holding your post back — and get clear steps to boost reach, visibility, and applications.`,
        background: '/card_backgrounds/bg8.png'
      },
      {
        component: Card_BeFound,
        title: 'Be Discovered',
        text: `Optimize your job post for AI-driven platforms like ChatGPT and Gemini — so more qualified candidates find you.`,
        background: '/card_backgrounds/bg4.webp'
      },
      {
        component: Card_MeasureOverTime,
        title: 'Track Your Wins',
        text: `Measure improvements over time and watch your visibility grow.`,
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
                  images={feature.images} 
                  background={feature.background} 
                />
              </div>
  
              <!-- Description Text -->
              <div class="mx-4 mt-4 text-left lg:text-left font-aeonik">
                <div class="p-2">
                  <p class="text-xl sm:text-2xl text-gray-700 tracking-wide mb-1">{feature.title}</p>
                  <span class="text-base sm:text-lg text-gray-500 leading-tight font-normal font-aeonik">
                    {feature.text}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>