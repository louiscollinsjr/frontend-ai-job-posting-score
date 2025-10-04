<script>
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
  
    // We use placeholder images from picsum.photos to demonstrate the image fading.
    // The first and last items have multiple images to showcase the transition.
    const defaultSections = [
      {
        title: 'Every word matters.',
        text: `Copy and paste or attach your job listing into JobPostScore. We review it completely then evaluates for clarity, structure, and discoverability.`,
        images: ['https://picsum.photos/id/10/600/400', 'https://picsum.photos/id/11/600/400']
      },
      {
        title: 'Know exactly where you stand.',
        text: `JobPostScore evaluates your listing against proven best practices and shows your optimization level, so you immediately know which areas need improvement.`,
        images: ['https://picsum.photos/id/20/600/400']
      },  
      {
        title: 'No guesswork, just action.',
        text: `JobPostScore highlights what’s limiting your reach and gives specific recommendations to improve every factor that drives AI visibility and candidate applications.`,
        images: ['https://picsum.photos/id/30/600/400']
      },
      {
        title: 'Be found where candidates search.',
        text: `Your job is optimized for AI-driven platforms like ChatGPT, Gemini, and other AI job-matching tools, ensuring more qualified candidates see it.`,
        images: ['https://picsum.photos/id/40/600/400']
      },
      {
        title: 'Measure your impact over time.',
        text: `Monitor your JobPostScore as you make changes, track improvements, and see how AI discoverability and candidate applications increase.`,
        images: ['https://picsum.photos/id/50/600/400', 'https://picsum.photos/id/60/600/400']
      }
    ];
  
    // The component accepts 'sections' as a prop, falling back to the default data.
    export let sections = defaultSections;
  
    // State to track the current image index for each card
    let currentImageIndices = sections.map(() => 0);
    /** @type {ReturnType<typeof setInterval> | undefined} */
    let intervalId;
  
    onMount(() => {
      // Set up an interval to cycle through images
      intervalId = setInterval(() => {
        currentImageIndices = currentImageIndices.map((currentIndex, sectionIndex) => {
          const imageCount = sections[sectionIndex].images.length;
          // Only advance the index if there's more than one image
          return imageCount > 1 ? (currentIndex + 1) % imageCount : 0;
        });
      }, 3500); // Change image every 3.5 seconds
    });
  
    // Clean up the interval when the component is destroyed to prevent memory leaks
    onDestroy(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });
  </script>
  
  <section class="features-section">
    <div class="header-content">
      <h2 class="sub-heading">Instantly Scored. Visibility Tested.</h2>
      <h1 class="main-heading">Your job post, refined for maximum visibility.</h1>
    </div>
  
    <div class="features-grid">
      {#each sections as section, i (section.title)}
        <div class="feature-card">
          <div class="image-container">
            <!-- The #key block is essential for Svelte to re-render the <img> 
                 element and trigger the in/out transitions for a smooth fade effect. -->
            {#key currentImageIndices[i]}
              <img 
                src={section.images[currentImageIndices[i]]} 
                alt={section.title}
                transition:fade={{ duration: 600 }}
              />
            {/key}
          </div>
          <div class="card-content">
            <h3 class="card-title">{section.title}</h3>
            <p class="card-text">{section.text}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>
  
  <style>
    :root {
      --brand-color: #4f46e5;
      --text-dark: #111827;
      --text-medium: #4b5563;
      --bg-light: #f8f9fa;
      --border-color: #e9ecef;
    }
  
    .features-section {
      width: 100%;
      max-width: 1200px;
      margin: 4rem auto;
      padding: 2rem 1rem;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  
    .header-content {
      margin-bottom: 3.5rem;
    }
  
    .sub-heading {
      color: var(--brand-color);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  
    .main-heading {
      font-size: clamp(2rem, 5vw, 2.75rem); /* Responsive font size */
      font-weight: 800;
      color: var(--text-dark);
      line-height: 1.2;
      max-width: 700px;
      margin: 0 auto;
    }
  
    /* Flexbox grid for responsive columns and centered last row */
    .features-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2rem;
    }
  
    .feature-card {
      /* Each card aims for a 3-column layout on large screens */
      flex: 1 1 320px;
      max-width: 380px;
      
      /* Ensures equal height for cards in the same row */
      display: flex;
      flex-direction: column;
      
      text-align: left;
      background-color: var(--bg-light);
      border-radius: 16px;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
      overflow: hidden; /* Ensures child elements respect the border radius */
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
  
    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07);
    }
  
    .image-container {
      position: relative; /* Crucial for absolute positioning of the image */
      width: 100%;
      aspect-ratio: 16 / 10;
      background-color: var(--border-color); /* Placeholder bg */
    }
  
    .image-container img {
      position: absolute; /* Allows images to stack for cross-fade effect */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  
    .card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1; /* Allows this container to fill the available space */
    }
  
    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-dark);
      margin: 0 0 0.75rem 0;
    }
  
    .card-text {
      font-size: 1rem;
      color: var(--text-medium);
      line-height: 1.6;
      margin: 0;
      flex-grow: 1; /* Pushes the text to take up space, aligning titles */
    }
  
    /* On smaller screens, cards will stack */
    @media (max-width: 768px) {
      .feature-card {
        flex-basis: 100%;
        max-width: 450px;
      }
    }
  </style>