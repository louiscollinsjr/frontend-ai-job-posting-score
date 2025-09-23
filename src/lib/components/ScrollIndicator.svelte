<script>
  import { onMount } from 'svelte';

  let scrollY = 0;
  let opacity = 1;

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

    window.addEventListener('scroll', updateScroll);
    window.addEventListener('resize', updateScroll);
    updateScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  });
</script>

<style>
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(-4px);
    }
  }
  
  .bounce-arrow {
    animation: bounce 2s infinite;
  }
</style>

<div 
  class="absolute bottom-4 right-4 z-40 pointer-events-none transition-opacity duration-300"
  style="opacity: {opacity}"
>
  <!-- Bouncing down arrow -->
  <div class="bounce-arrow">
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="text-gray-600"
    >
      <path 
        d="M12 4L12 20M12 20L6 14M12 20L18 14" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
  </div>
</div>

