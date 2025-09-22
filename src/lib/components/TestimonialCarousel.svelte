<script>
  import Card from '$lib/components/ui/card/card.svelte'
  import CardContent from '$lib/components/ui/card/card-content.svelte'
  import CardFooter from '$lib/components/ui/card/card-footer.svelte'
  import BetaBadge from '$lib/components/BetaBadge.svelte'
  
  export let testimonials = [
    {
      quote: "JobPostScore showed us why our posts weren't being seen, and helped the right candidates find us.",
      name: "Sarah Johnson",
      role: "Talent Acquisition Manager",
      company: "TechCorp",
      avatarColor: "bg-[#c679c4]"
    },
    {
      quote: "Our response rate doubled after making the fixes JobPostScore recommended.",
      name: "Michael Chen",
      role: "Recruitment Marketing Specialist",
      company: "GrowthCo",
      avatarColor: "bg-[#fa3d1d]"
    },
    {
      quote: "The analytics made it clear why our posts underperformed and what to change.",
      name: "David Wilson",
      role: "HR Director", 
      company: "ScaleUp Inc",
      avatarColor: "bg-[#ffb005]"
    },
    {
      quote: "JobPostScore uncovered gaps we missed and brought us a stronger candidate pool.",
      name: "Emma Davis",
      role: "Hiring Manager",
      company: "InnovateLab",
      avatarColor: "bg-[#e1e1fe]"
    },
    {
      quote: "No more guessing. JobPostScore scored our posts and showed us exactly what to fix.",
      name: "James Rodriguez",
      role: "Recruiter",
      company: "TalentFirst",
      avatarColor: "bg-[#0358f7]"
    }
  ]
  
  let primarySpeed = 40; // Slower, more professional pace
</script>

<div class="flex flex-col items-center w-full mx-auto mt-24 mb-32 overflow-hidden">
  <h2 class="relative z-10 mx-auto sm:text-5xl text-3xl font-aeonik mb-24">
    Trusted by Talent Acquisition 
    <span class="inline-flex pb-1 chroma-text chroma-text-animate">Teams</span>
  </h2>
  
  <div class="relative w-full overflow-hidden marquee-wrapper">
    <!-- Professional fade overlays -->
    <div class="fade-overlay left-0"></div>
    <div class="fade-overlay right-0"></div>
    
    <div class="marquee-container">
      <div class="marquee-content" style="--speed: {primarySpeed}s">
        {#each [...testimonials, ...testimonials] as testimonial, i}
          <div class="marquee-item">
            <Card class="testimonial-card bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md mx-4 w-80 h-64 flex-shrink-0 flex flex-col relative overflow-hidden group">
              
              <!-- Subtle decorative quote mark -->
              <div class="absolute top-5 right-5 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <CardContent class="p-6 pb-4 flex-1 relative z-10">
                <blockquote class="text-base text-gray-700 font-aeonik leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
              
              <CardFooter class="px-6 pb-6 pt-2 border-t border-gray-50 bg-gray-50/30">
                <div class="flex items-center gap-3">
                  <!-- Colorful avatar with solid backgrounds -->
                  <div class="w-12 h-12 rounded-full {testimonial.avatarColor} border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {testimonial.name.split(' ').length > 1 
                        ? testimonial.name.split(' ')[0][0] + '. ' + testimonial.name.split(' ').slice(-1)[0]
                        : testimonial.name}
                    </p>
                    <!-- <p class="text-xs text-gray-600 truncate">{testimonial.role}</p>
                    <p class="text-xs text-gray-500 truncate">{testimonial.company}</p> -->
                  </div>
                </div>
              </CardFooter>
              
              <!-- Subtle hover effect -->
              <div class="absolute inset-0 border border-transparent group-hover:border-gray-200 rounded-lg transition-colors duration-300 pointer-events-none"></div>
            </Card>
          </div>
        {/each}
      </div>
    </div>
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
  
  .testimonial-card {
    border-radius: 12px;
    transition: all 0.3s ease-out;
    transform-origin: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
  
  .testimonial-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .fade-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 8%;
    z-index: 20;
  }
  
  .fade-overlay.left-0 {
    left: 0;
    background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,0) 100%);
  }
  
  .fade-overlay.right-0 {
    right: 0;
    background: linear-gradient(270deg, #ffffff 0%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,0) 100%);
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
    width: 60px;
    z-index: 15;
    pointer-events: none;
  }
  
  .marquee-wrapper::before {
    left: 0;
    background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%);
  }
  
  .marquee-wrapper::after {
    right: 0;
    background: linear-gradient(270deg, #ffffff 0%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%);
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
