<script>
  import Logo from '$lib/components/Logo.svelte';

  // Data for the three main points about JobPostScore
  const sections = [
    {
      title: 'Write job posts that candidates actually find',
      text: 'JobPostScore shows you how clear, inclusive, and discoverable your postings are across AI-powered platforms. With better visibility, you\'ll attract more qualified candidates without rewriting the role over and over.',
      image: '/how01.png',
      alt: 'JobPostScore Browser 01',
      icon: 'pen',
      blurb: 'Perfect Postings'
    },
    {
      title: 'Benchmark and improve at scale',
      text: 'Instead of guessing, you\'ll see instant feedback on how your jobs perform compared to industry standards. Over time, you can use the data to improve all postings in your ATS feed—not just one-off edits.',
      image: '/how02.png',
      alt: 'JobPostScore Browser 02',
      icon: 'chart-bar',
      blurb: 'Benchmark and Improve'
    },
    {
      title: 'Save time and reduce drop-offs',
      text: 'A well-scored job post means fewer unqualified applicants, less back-and-forth, and more completed applications. You\'ll spend more time with serious candidates and less time filtering noise.',
      image: '/how03.png',
      alt: 'JobPostScore Browser 03',
      icon: 'clock',
      blurb: 'Save Time'
    }
  ];
</script>

<section class="w-full mx-auto p-12 text-left font-aeonik my-36 rounded-2xl">
  <div class="mb-14">
    <!-- <h2 class="text-gray-600 text-lg font-semibold mb-2">Why JobPostScore?</h2> -->
    <h1 class="text-3xl md:text-4xl text-gray-900 leading-tight max-w-4xl font-aeonik">
      How MyJobPost<b>Score</b> can help:
      <!-- <Logo variant="black" imgClass="h-12 w-auto inline mx-1" alt="JobPostScore" /> -->
    </h1>
  </div>

  <div class="flex flex-wrap justify-center md:gap-32 gap-16">
    {#each sections as section, i (section.title)}
      <div class="flex-1 min-w-80 max-w-lg flex flex-col text-left rounded-2xl">
        <div class="p-0 flex flex-col flex-grow">
          <div class="flex items-center gap-2 mb-4">
          <div class="relative p-3 rounded-3xl bg-gray-200">
            <img src={section.image} alt={section.alt} class="w-full object-contain rounded-2xl" />
            <div class="absolute bottom-6 right-6 bg-black/50 rounded-lg p-2 shadow-sm text-white/50">
              {#if section.icon === 'pen'}
                <svg class="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              {:else if section.icon === 'chart-bar'}
                <svg class="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              {:else if section.icon === 'clock'}
                <svg class="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              {/if}
            </div>
          </div>
            <!-- <h3 class="text-xl font-semibold text-gray-900">{section.blurb}</h3> -->
          </div>
          <h3 class="text-3xl max-w-[350px] text-gray-900 my-5 font-aeonik">{section.title}</h3>
          <p class="text-gray-500 text-lg leading-relaxed flex-grow font-aeonik">{section.text}</p>
        </div>
        <a href="/login" class="text-black hover:text-gray-600 font-sans underline mt-2">Create your account</a>
      </div>
    {/each}
  </div>
  
</section>
