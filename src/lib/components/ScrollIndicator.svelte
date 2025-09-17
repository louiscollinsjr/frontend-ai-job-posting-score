<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import lottie from 'lottie-web';

  let scrollY = 0;
  let opacity = 1;
  let container;
  let animation;

  onMount(() => {
    const updateScroll = () => {
      scrollY = window.scrollY;
      
      // Get the hero section element
      const heroElement = document.getElementById('hero');
      if (heroElement) {
        const heroRect = heroElement.getBoundingClientRect();
        const heroTop = heroRect.top;
        const heroBottom = heroRect.bottom;
        const windowHeight = window.innerHeight;
        
        // Fade out as the hero section moves up off screen
        // Start fading when top of hero is at 50% of viewport height
        if (heroTop < windowHeight * 0.5) {
          const fadeProgress = Math.abs(heroTop) / (windowHeight * 0.5);
          opacity = Math.max(0, 1 - fadeProgress);
        } else {
          // Hero section is in the top half of screen or above - fully visible
          opacity = 1;
        }
        
        // Ensure opacity doesn't go below 0
        opacity = Math.max(0, opacity);
      }
    };

    // Initialize Lottie animation
    if (container) {
      // Use JSON file instead of .lottie file
      animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/lotties/mouse-scroll.json'
      });
    }

    window.addEventListener('scroll', updateScroll);
    window.addEventListener('resize', updateScroll);
    updateScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      if (animation) {
        animation.destroy();
      }
    };
  });
</script>

<div 
  class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-300"
  style="opacity: {opacity}"
>
  <!-- Increased size to w-16 h-16 for a larger animation -->
  <div bind:this={container} class="w-16 h-16"></div>
</div>

