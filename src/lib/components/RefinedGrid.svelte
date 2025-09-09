<script>
    import CardA_Meeting from '$lib/components/CardA_Meeting.svelte';
    import CardB_Code from '$lib/components/CardB_Code.svelte';
    import CardC_Video from '$lib/components/CardC_Video.svelte';
    import Card_EveryWordMatters from '$lib/components/Card_EveryWordMatters.svelte';
    import Card_KnowExactlyWhereYouStand from '$lib/components/Card_KnowExactlyWhereYouStand.svelte';
  
    const features = [
      {
        component: Card_EveryWordMatters,
        title: 'Every word matters.',
        text: `Copy and paste or attach your job listing into JobPostScore. We review it completely then evaluates for clarity, structure, and discoverability.`,
        images: ['https://picsum.photos/id/10/600/400', 'https://picsum.photos/id/11/600/400']
      },
      {
        component: Card_KnowExactlyWhereYouStand,
        title: 'Know exactly where you stand.',
        text: `JobPostScore evaluates your listing against proven best practices and shows your optimization level, so you immediately know which areas need improvement.`,
        images: ['https://picsum.photos/id/20/600/400']
      },
      {
        component: CardC_Video,
        title: 'No guesswork, just action.',
        text: `JobPostScore highlights what’s limiting your reach and gives specific recommendations to improve every factor that drives AI visibility and candidate applications.`,
        images: ['https://picsum.photos/id/30/600/400']
      },
      {
        component: CardA_Meeting,
        title: 'Be found where candidates search.',
        text: `Your job is optimized for AI-driven platforms like ChatGPT, Gemini, and other AI job-matching tools, ensuring more qualified candidates see it.`,
        images: ['https://picsum.photos/id/40/600/400']
      },
      {
        component: CardA_Meeting,
        title: 'Measure your impact over time.',
        text: `Monitor your JobPostScore as you make changes, track improvements, and see how AI discoverability and candidate applications increase.`,
        images: ['https://picsum.photos/id/50/600/400', 'https://picsum.photos/id/60/600/400']
      },
    ];
  </script>
  
  <section class="w-full bg-white py-20">
    <div class="mx-auto max-w-7xl px-8">
      <!-- Header Text -->
      <div class="text-left">
        <h2 class="text-lg text-blue-400 font-aeonik">Your job post, refined for maximum visibility.</h2>
        <p class="text-2xl md:text-5xl text-black font-aeonik mt-3 mb-12">
            Instantly Scored. Visibility Tested.
        </p>
      </div>
  
      <!-- Features Grid -->
      <div class="mt-16 inline-grid justify-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature}
          <div class="flex flex-col">
            <!-- Card Component -->
            <div class="h-[380px]"> <!-- Set a fixed height for all cards -->
              <svelte:component this={feature.component} />
            </div>
  
            <!-- Description Text -->
            <div class="mt-3 text-center lg:text-left">
              <div class="p-2">
                <span class="text-sm text-gray-600 leading-tight">
                  <strong class="text-sm font-bold text-gray-900">{feature.title}</strong> {feature.text}
                </span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>