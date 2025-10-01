<script>
  import { onMount } from 'svelte';

  const features = [
    {
      title: 'Every Word Counts',
      text: `Copy and paste or attach your job listing into JobPostScore. We review it completely then evaluates for clarity, structure, and discoverability.`,
      media: '/ScreenDummy.png',
      mediaType: 'image',
      gradient: 'linear-gradient(135deg, #fa3d1d 0%, #ffb005 100%)'
    },
    {
      title: 'Know Exactly Where You Stand',
      text: `JobPostScore evaluates your listing against proven best practices and shows your optimization level, so you immediately know which areas need improvement.`,
      media: '/ScreenDummy.png',
      mediaType: 'image',
      gradient: 'linear-gradient(135deg, #0358f7 0%, #00d4ff 100%)'
    },
    {
      title: 'No Guesswork, Just Action',
      text: `JobPostScore highlights what's limiting your reach and gives specific recommendations to improve every factor that drives AI visibility and candidate applications.`,
      media: '/ScreenDummy.png',
      mediaType: 'image',
      gradient: 'linear-gradient(135deg, #ffb005 0%, #ffd700 100%)'
    },
    {
      title: 'Be Found Where Candidates Search',
      text: `Your job is optimized for AI-driven platforms like ChatGPT, Gemini, and other AI job-matching tools, ensuring more qualified candidates see it.`,
      media: '/ScreenDummy.png',
      mediaType: 'image',
      gradient: 'linear-gradient(135deg, #c679c4 0%, #ff6ec7 100%)'
    },
    {
      title: 'Measure Your Impact Over Time',
      text: `Monitor your JobPostScore as you make changes, track improvements, and see how AI discoverability and candidate applications increase.`,
      media: '/ScreenDummy.png',
      mediaType: 'image',
      gradient: 'linear-gradient(135deg, #0358f7 0%, #c679c4 100%)'
    }
  ];

  const SLIDE_TRANSITION_MS = 1500;
  const SLIDE_PAUSE_MS = 6000; // time to pause on each slide after the transition completes

  let currentIndex = 0;
  let autoplayTimer;

  function goToSlide(index) {
    currentIndex = index;
    resetAutoplay();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % features.length;
    resetAutoplay();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + features.length) % features.length;
    resetAutoplay();
  }

  function resetAutoplay() {
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
    }

    autoplayTimer = setTimeout(() => {
      currentIndex = (currentIndex + 1) % features.length;
      resetAutoplay();
    }, SLIDE_TRANSITION_MS + SLIDE_PAUSE_MS);
  }

  onMount(() => {
    resetAutoplay();
    return () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
    };
  });
</script>

<section class="relative p-0 bg-gradient-to-br from-[#f8f8f8dc]/10 via-[#ffe417]/10 to-[#0358f7]/10 rounded-2xl mb-8 overflow-hidden font-aeonik">
  <div class="w-full relative sm:px-8 sm:py-20">
    <div class="text-left">
      <p class="text-3xl md:text-5xl text-black sm:font-normal font-aeonik my-0 max-w-3xl px-8 pt-10">
        Job Postings, reimagined for the AI search era.
      </p>
      <p class="text-base sm:text-lg text-gray-500 max-w-2xl font-aeonik mb-12 p-8 pl-8">
        Your <b class="text-gray-900">JobPostScore</b> reveals how easily candidates discover your role in today's AI-driven job search, highlights visibility gaps, and guides you on how to improve.
      </p>
    </div>

    <!-- Carousel Container -->
    <div class="mt-0 flex flex-col items-center w-full px-4 pb-12">
      <!-- Navigation Arrows and Dots -->
      <div class="flex items-center gap-4 mb-24">
        <!-- Previous Button -->
        <button
          on:click={prevSlide}
          class="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
          aria-label="Previous slide"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Dot Navigation -->
        <div class="flex gap-2">
          {#each features as _, index}
            <button
              on:click={() => goToSlide(index)}
              class="w-2 h-2 rounded-full transition-all duration-300 {currentIndex === index ? 'bg-gray-900 w-6' : 'bg-gray-300 hover:bg-gray-400'}"
              aria-label={`Go to slide ${index + 1}`}
            />
          {/each}
        </div>

        <!-- Next Button -->
        <button
          on:click={nextSlide}
          class="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
          aria-label="Next slide"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Current Feature Title -->
      <div class="text-center mb-6">
        <h3 class="text-3xl sm:text-4xl font-normal text-gray-900 font-aeonik">
          {features[currentIndex].title}
        </h3>
      </div>

      <!-- Carousel Slide -->
      <div class="w-full max-w-7xl relative overflow-hidden">
        <div class="flex transition-transform duration-[700ms] ease-in-out" style="transform: translateX(-{currentIndex * 100}%)">
          {#each features as feature}
            <div class="w-full flex-shrink-0 px-4">
              <!-- Feature Card -->
              <div class="bg-gray-50/150 rounded-2xl p-8 sm:p-12 mx-auto max-w-7xl">
                <!-- Feature Image/Video with Gradient Background -->
                <div class="mb-8 rounded-xl overflow-hidden shadow-lg p-8" style="background: {feature.gradient}">
                  <div class="flex items-center justify-center">
                    {#if feature.mediaType === 'video'}
                      <video
                        src={feature.media}
                        alt={`Preview for ${feature.title}`}
                        class="w-full max-w-[980px] rounded-lg shadow-xl"
                        style="max-height: 550px; height: auto; display: block;"
                        autoplay
                        muted
                        loop
                        playsinline
                      />
                    {:else}
                      <img
                        src={feature.media}
                        alt={`Preview for ${feature.title}`}
                        class="w-full max-w-[980px] rounded-lg shadow-xl"
                        style="max-height: 550px; height: auto; display: block;"
                        loading="lazy"
                      />
                    {/if}
                  </div>
                </div>

                <!-- Feature Description -->
                <div class="min-h-[7rem] flex items-center justify-center">
                  <p class="text-base sm:text-lg text-gray-600 leading-relaxed font-aeonik max-w-2xl mx-auto text-center">
                    {feature.text}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
