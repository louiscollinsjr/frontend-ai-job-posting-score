<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import lottie from 'lottie-web';
  import type { AnimationItem } from 'lottie-web';

  let scrollY = 0;
  let opacity = 1;
  let container: HTMLElement | null = null;
  let animation: AnimationItem | null = null;

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

    // Initialize Lottie animation with a simple scroll animation
    if (container) {
      animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        // Simple scroll down animation data
        animationData: {
          v: "5.7.4",
          fr: 30,
          ip: 0,
          op: 30,
          w: 100,
          h: 100,
          nm: "Mouse Scroll",
          ddd: 0,
          assets: [],
          layers: [
            {
              ddd: 0,
              ind: 1,
              ty: 4,
              nm: "Mouse",
              sr: 1,
              ks: {
                o: { a: 0, k: 100, ix: 11 },
                r: { a: 0, k: 0, ix: 10 },
                p: { a: 0, k: [50, 50, 0], ix: 2 },
                a: { a: 0, k: [0, 0, 0], ix: 1 },
                s: { a: 0, k: [100, 100, 100], ix: 6 }
              },
              ao: 0,
              shapes: [
                {
                  ty: "gr",
                  it: [
                    {
                      ty: "rc",
                      d: 1,
                      s: { a: 0, k: [24, 40], ix: 2 },
                      p: { a: 0, k: [0, 0], ix: 3 },
                      r: { a: 0, k: 12, ix: 4 },
                      nm: "Mouse Body",
                      mn: "ADBE Vector Shape - Rect",
                      hd: false
                    },
                    {
                      ty: "st",
                      c: { a: 0, k: [0.4, 0.4, 0.4, 1], ix: 3 },
                      o: { a: 0, k: 100, ix: 4 },
                      w: { a: 0, k: 2, ix: 5 },
                      lc: 2,
                      lj: 1,
                      ml: 4,
                      bm: 0,
                      nm: "Stroke",
                      mn: "ADBE Vector Graphic - Stroke",
                      hd: false
                    },
                    {
                      ty: "fl",
                      c: { a: 0, k: [1, 1, 1, 1], ix: 4 },
                      o: { a: 0, k: 0, ix: 5 },
                      r: 1,
                      bm: 0,
                      nm: "Fill",
                      mn: "ADBE Vector Graphic - Fill",
                      hd: false
                    },
                    {
                      ty: "tr",
                      p: { a: 0, k: [0, 0], ix: 2 },
                      a: { a: 0, k: [0, 0], ix: 1 },
                      s: { a: 0, k: [100, 100], ix: 3 },
                      r: { a: 0, k: 0, ix: 6 },
                      o: { a: 0, k: 100, ix: 7 },
                      sk: { a: 0, k: 0, ix: 4 },
                      sa: { a: 0, k: 0, ix: 5 },
                      nm: "Transform"
                    }
                  ],
                  nm: "Mouse Body",
                  np: 3,
                  cix: 2,
                  bm: 0,
                  ix: 1,
                  mn: "ADBE Vector Group",
                  hd: false
                },
                {
                  ty: "gr",
                  it: [
                    {
                      ty: "rc",
                      d: 1,
                      s: { a: 0, k: [4, 8], ix: 2 },
                      p: { a: 1, k: [
                        { t: 0, s: [0, -10], h: 1, o: { x: [0.167], y: [0.167] } },
                        { t: 15, s: [0, -5], h: 1, o: { x: [0.167], y: [0.167] } },
                        { t: 30, s: [0, -10], h: 1 }
                      ], ix: 3 },
                      r: { a: 0, k: 2, ix: 4 },
                      nm: "Scroll Ball",
                      mn: "ADBE Vector Shape - Rect",
                      hd: false
                    },
                    {
                      ty: "st",
                      c: { a: 0, k: [0.4, 0.4, 0.4, 1], ix: 3 },
                      o: { a: 0, k: 0, ix: 4 },
                      w: { a: 0, k: 0, ix: 5 },
                      lc: 1,
                      lj: 1,
                      ml: 4,
                      bm: 0,
                      nm: "Stroke",
                      mn: "ADBE Vector Graphic - Stroke",
                      hd: false
                    },
                    {
                      ty: "fl",
                      c: { a: 0, k: [0.4, 0.4, 0.4, 1], ix: 4 },
                      o: { a: 0, k: 100, ix: 5 },
                      r: 1,
                      bm: 0,
                      nm: "Fill",
                      mn: "ADBE Vector Graphic - Fill",
                      hd: false
                    },
                    {
                      ty: "tr",
                      p: { a: 0, k: [0, 0], ix: 2 },
                      a: { a: 0, k: [0, 0], ix: 1 },
                      s: { a: 0, k: [100, 100], ix: 3 },
                      r: { a: 0, k: 0, ix: 6 },
                      o: { a: 0, k: 100, ix: 7 },
                      sk: { a: 0, k: 0, ix: 4 },
                      sa: { a: 0, k: 0, ix: 5 },
                      nm: "Transform"
                    }
                  ],
                  nm: "Scroll Ball",
                  np: 3,
                  cix: 2,
                  bm: 0,
                  ix: 2,
                  mn: "ADBE Vector Group",
                  hd: false
                }
              ],
              ip: 0,
              op: 30,
              st: 0,
              bm: 0
            }
          ],
          markers: []
        }
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
  <div bind:this={container} class="w-6 h-6"></div>
</div>
