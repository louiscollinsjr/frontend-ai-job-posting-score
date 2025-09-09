<script lang="ts">
  import { onMount } from 'svelte';
  let activeIndex = 0;
  let lastActiveIndex = 0; // Track the last active index to prevent skipping
  let blocks: HTMLElement[] = [];
  let headerElement: HTMLElement;
  let imageElement: HTMLElement;
  let isHeaderVisible = true;
  
  // This will hold the calculated sticky top position
  let stickyTopPosition = '30vh';
  
  // Function to safely change the active index and prevent skips
  function updateActiveIndex(newIndex: number) {
    // Only allow moving to adjacent sections (or staying the same)
    if (newIndex === activeIndex) return;
    
    // When scrolling down, only allow going to the next section
    if (newIndex > activeIndex && newIndex > activeIndex + 1) {
      activeIndex = activeIndex + 1;
    }
    // When scrolling up, only allow going to the previous section
    else if (newIndex < activeIndex && newIndex < activeIndex - 1) {
      activeIndex = activeIndex - 1;
    } 
    // Adjacent section change is allowed
    else {
      activeIndex = newIndex;
    }
    
    lastActiveIndex = activeIndex;
  }

  // Images to use for each block
  const images = [
    '/Browser01.png',
    '/Browser02.png',
    '/Browser03.png',
    '/Browser02.png',
    '/Browser01.png'
  ];

  const sections = [
    {
      title: 'Every word matters.',
      header: 'Every word matters.',
      text: `Copy and paste or attach your job listing into JobPostScore. We review it completely then evaluates for clarity, structure, and discoverability.`,
      images: ['/Browser01.png']
    },
    {
      title: 'Know exactly where you stand.',
      header: 'Know exactly where you stand.',
      text: `JobPostScore evaluates your listing against proven best practices and shows your optimization level, so you immediately know which areas need improvement.`,
      images: ['/Browser01.png']
    },  
    {
      title: 'No guesswork, just action.',
      header: 'No guesswork, just action.',
      text: `JobPostScore highlights what’s limiting your reach and gives specific recommendations to improve every factor that drives AI visibility and candidate applications.`,
      images: ['/Browser01.png']
    },
    {
      title: 'Be found where candidates search.',
      header: 'Be found where candidates search.',
      text: `Your job is optimized for AI-driven platforms like ChatGPT, Gemini, and other AI job-matching tools, ensuring more qualified candidates see it.
`,
      images: ['/Browser01.png']
    },
    {
      title: 'Measure your impact over time.',
      header: 'Measure your impact over time.',
      text: `Monitor your JobPostScore as you make changes, track improvements, and see how AI discoverability and candidate applications increase.`,
      images: ['/Browser01.png']
    }
  ];

  // Define the function that calculates sticky position
  function calculateStickyPosition() {
    if (imageElement) {
      // Get the image's bounding rectangle
      const rect = imageElement.getBoundingClientRect();
      // Calculate the position from the top of the viewport to the top of the image
      // and convert to vh units to maintain position during scrolling
      const positionInVh = (rect.top / window.innerHeight) * 100;
      stickyTopPosition = `${positionInVh}vh`;
    }
  }
  
  // Intersection Observer logic
  onMount(() => {
    // Calculate the initial position of the image to prevent jumping when it becomes sticky
    setTimeout(() => {
      calculateStickyPosition();
      // Add resize listener
      window.addEventListener('resize', calculateStickyPosition);
    }, 100); // Small delay to ensure elements are rendered
    
    // Observer for content blocks to track active section with improved detection
    const contentObserver = new window.IntersectionObserver(
      (entries) => {
        // Find all entries that are currently intersecting
        const intersectingEntries = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => {
            const idx = Number(entry.target.getAttribute('data-index'));
            console.log(`Section ${idx} visible with ratio: ${entry.intersectionRatio}`);
            return { idx, ratio: entry.intersectionRatio };
          });
        
        // If we have intersecting entries, find the most visible one
        if (intersectingEntries.length > 0) {
          // Sort by intersection ratio (highest first)
          intersectingEntries.sort((a, b) => b.ratio - a.ratio);
          const targetIdx = intersectingEntries[0].idx;
          
          // Use our safer update function to prevent skips
          updateActiveIndex(targetIdx);
          console.log('Target section:', targetIdx, 'Active section:', activeIndex);
        }
      },
      {
        root: null,
        rootMargin: '-15% 0px -15% 0px', // Adjust margin for better section detection
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7] // More threshold points for smoother detection
      }
    );
    
    // Make sure all blocks are observed
    setTimeout(() => {
      blocks.forEach((el, idx) => {
        if (el) {
          contentObserver.observe(el);
          console.log('Observing block', idx);
        }
      });
    }, 100); // Small timeout to ensure elements are in DOM
    
    // Observer for header to track when it's out of view
    const headerObserver = new window.IntersectionObserver(
      ([entry]) => {
        isHeaderVisible = entry.isIntersecting;
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-10px 0px 0px 0px' // small margin to trigger slightly before header is completely out of view
      }
    );
    if (headerElement) {
      headerObserver.observe(headerElement);
    }
    
    return () => {
      // Clean up all observers and event listeners
      contentObserver.disconnect();
      headerObserver.disconnect();
      window.removeEventListener('resize', calculateStickyPosition);
    };
  });
</script>

<section class="scroll-telling-howitworks w-full py-24 border-2 border-gray-100 rounded-2xl p-8 mb-20">
  <div class="container mx-auto px-4">
    <!-- Title section - full width in its own row -->
    <div class="mb-40 h-[150px]" bind:this={headerElement}>
      <h2 class="text-3xl md:text-4xl font-normal text-black max-w-lg">JobPostScore transforms your hiring content</h2>
    </div>
    
    <!-- Content section -->
    <div class="sticky-container" class:header-not-visible={!isHeaderVisible}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative">
        <!-- Left sticky image column -->
        <div class="image-column order-2 md:order-1">
          <div class="sticky-image" bind:this={imageElement} style="--sticky-top: {stickyTopPosition};">
            {#each images as img, i}
              <img
                src={img}
                alt="How JobPostScore works step {i+1}"
                class="image transition-opacity duration-300"
                style="opacity: {activeIndex === i ? 1 : 0}; z-index: {activeIndex === i ? 2 : 1}; pointer-events: none;"
                draggable="false"
              />
            {/each}
          </div>
        </div>
        <!-- Right scroll-telling text -->
        <div class="text-column flex flex-col gap-20 order-1 md:order-2 padding">
         
          {#each sections as section, i}
            <h3 class="text-2xl md:text-3xl font-semibold mb-4 text-black">{section.title}</h3>
            <!--image bsaed on section index-->
            <img
              src={section.images[0]}
              alt="How JobPostScore works step {i+1}"
              class="w-full h-auto"
              style=" z-index: {activeIndex === i ? 2 : 1}; pointer-events: none;"
              draggable="false"
            />
              <p class="text-base md:text-base  text-gray-700 max-w-2xl">
                <strong class="text-base md:text-base  text-black">{section.header}</strong>
                {section.text}
              </p>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .sticky-container {
    position: relative;
    width: 100%;
    padding-top: 0; /* No artificial padding needed */
  }

  .image-column {
    position: relative;
    height: 100%;
  }
  
  .sticky-image {
    position: relative; /* Start as relative */
    top: 0;
    transform: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 500px;
  }
  
  /* Sticky state is applied conditionally via JS */
  :global(.header-not-visible) .sticky-image {
    position: sticky;
    top: var(--sticky-top); /* Use calculated position from JS */
    transform: translateY(0); /* No transform needed */
  }
  
  .image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .text-column {
    padding-bottom: 200px; /* More space at bottom to ensure the sticky behavior lasts through the last point */
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Better spacing between items */
  }

  @media (max-width: 768px) {
    .scroll-telling-howitworks .container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .sticky-image {
      position: static;
      transform: none;
      height: 220px;
      margin: 2rem 0;
    }
    
    .image {
      position: static !important;
      width: 100% !important;
      height: 200px !important;
      object-fit: contain;
      margin-bottom: 2.5rem;
    }
    
    .text-column {
      padding-bottom: 0;
    }
  }
</style>
