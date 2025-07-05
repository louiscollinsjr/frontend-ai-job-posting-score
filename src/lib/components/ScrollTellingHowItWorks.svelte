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
    '/Browser01.png',
    '/Browser01.png'
  ];

  const sections = [
    {
      header: 'Reads your job posts completely',
      text: `ReachScore analyzes every element of your job content — titles, descriptions, requirements, benefits — understanding clarity, structure, and searchability.`
    },
    {
      header: 'Scores your optimization level',
      text: `ReachScore evaluates your posts against proven best practices, showing you exactly where you rank on the factors that drive visibility and applications.`
    },
    {
      header: 'Shows you what to fix',
      text: `Just paste your job post. ReachScore identifies what's limiting your reach and gives you the specific changes that improve your score — no guesswork.`
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

<section class="scroll-telling-howitworks w-full py-24">
  <div class="container mx-auto px-4">
    <!-- Title section - full width in its own row -->
    <div class="mb-40 h-[150px]" bind:this={headerElement}>
      <h2 class="text-3xl md:text-4xl font-normal text-black max-w-lg">ReachScore transforms your hiring content</h2>
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
                alt="How ReachScore works step {i+1}"
                class="image transition-opacity duration-300"
                style="opacity: {activeIndex === i ? 1 : 0}; z-index: {activeIndex === i ? 2 : 1}; pointer-events: none;"
                draggable="false"
              />
            {/each}
          </div>
        </div>
        <!-- Right scroll-telling text -->
        <div class="text-column flex flex-col gap-48 order-1 md:order-2 padding">
          {#each sections as section, i}
            <div
              class="scroll-telling-block min-h-[350px] flex flex-col justify-center py-24 md:py-36"
              bind:this={blocks[i]}
              data-index={i}
            >
              <h3 class="text-2xl md:text-3xl font-semibold mb-4 text-black">{section.header}</h3>
              <p class="text-lg md:text-xl text-gray-700 max-w-2xl">{section.text}</p>
            </div>
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
    
    .scroll-telling-block {
      min-height: 180px;
      margin-bottom: 4rem;
    }
    
    .text-column {
      padding-bottom: 0;
    }
  }
</style>
