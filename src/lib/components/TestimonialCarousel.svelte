<script>
  import Card from '$lib/components/ui/card/card.svelte'
  import CardContent from '$lib/components/ui/card/card-content.svelte'
  import CardFooter from '$lib/components/ui/card/card-footer.svelte'
  import BetaBadge from '$lib/components/BetaBadge.svelte'
  
  export let testimonials = [
    {
      quote: "JobPostScore showed us why our posts weren’t being seen, and helped the right candidates find us.",
      name: "Sarah Johnson",
      role: "Talent Acquisition Manager",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "Our response rate doubled after making the fixes JobPostScore recommended.",
      name: "Michael Chen",
      role: "Recruitment Marketing Specialist",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "The analytics made it clear why our posts underperformed and what to change.",
      name: "David Wilson",
      role: "HR Director",
      image: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
      quote: "JobPostScore uncovered gaps we missed and brought us a stronger candidate pool.",
      name: "Sarah Johnson",
      role: "Hiring Manager",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "No more guessing. JobPostScore scored our posts and showed us exactly what to fix.",
      name: "Michael Chen",
      role: "Recruiter",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ]
  
  let speed = 30; // seconds to complete one full scroll
</script>

<div class="flex flex-col items-center w-full mx-auto mt-24 mb-32 overflow-hidden">
  <h2 class="relative z-10 mx-auto sm:text-5xl text-3xl font-aeonik mb-24">
    Trusted by Talent Acquisition 
    <span class="inline-flex pb-1 chroma-text chroma-text-animate">&nbsp;Teams</span>
  </h2>
  
  <div class="relative w-full overflow-hidden marquee-wrapper">
    <div class="fade-overlay left-0"></div>
    <div class="fade-overlay right-0"></div>
    <div class="marquee-container">
      <div class="marquee-content" style="--speed: {speed}s">
        {#each [...testimonials, ...testimonials] as testimonial, i}
          <div class="marquee-item">
            <Card class="p-6 rounded-3xl bg-white/90 backdrop-blur-lg shadow-sm mx-4 w-72 h-60 flex-shrink-0 flex flex-col">
              <CardContent class="p-0 flex-1">
                <blockquote class="text-lg text-gray-500 font-aeonik line-clamp-4">
                  {testimonial.quote}
                </blockquote>
              </CardContent>
              <CardFooter class="p-0 pt-4 flex items-center gap-3 text-sm">
                <!-- <img 
                  src={testimonial.image} 
                  alt={`Photo of ${testimonial.name}`} 
                  class="w-12 h-12 rounded-full object-cover" 
                  loading="lazy"
                /> -->
                <div>
                  <!-- <p class="text-gray-600 font-medium">{testimonial.name}</p> -->
                  <p class="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div class="container mx-auto text-center mt-24 text-xs text-gray-400">
    <BetaBadge />
	</div>
</div>

<style>
  .marquee-container {
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  
  .marquee-content {
    display: flex;
    width: max-content;
    animation: scroll var(--speed) linear infinite;
  }
  
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  .marquee-item {
    flex-shrink: 0;
  }
  
  .fade-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 20%;
    background-image: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
  }
  
  .fade-overlay.left-0 {
    left: 0;
    background-image: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
  }
  
  .fade-overlay.right-0 {
    right: 0;
  }
  
  .marquee-wrapper {
    position: relative;
  }
  
  .marquee-wrapper::before,
  .marquee-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100px;
    z-index: 10;
    pointer-events: none;
  }
  
  .marquee-wrapper::before {
    left: 0;
    background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 100%);
  }
  
  .marquee-wrapper::after {
    right: 0;
    background: linear-gradient(270deg, #ffffff 0%, rgba(255,255,255,0) 100%);
  }
  
  .chroma-text {
    background-image: linear-gradient(90deg, 
      #000000 0%, 
      #000000 35%, 
      #c679c4 40%, 
      #fa3d1d 42%, 
      #ffb005 44%, 
      #e1e1fe 46%, 
      #0358f7 48%, 
      #000000 50%, 
      #000000 100%);
    background-size: 800% 100%;
    background-position: 100% 0;
    will-change: background-position;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  
  .chroma-text-animate {
    animation: chroma-sweep 2s ease-in-out 3s 1 forwards;
  }
  
  @keyframes chroma-sweep {
    0% {
      -webkit-text-fill-color: initial;
      background-position: 100% 0;
    }
    100% {
      -webkit-text-fill-color: transparent;
      background-position: 0 0;
    }
  }
</style>
