<script lang="ts">
  // Add any needed imports for minimalist blocks and UI
  import { Card } from '$lib/components/ui/card';
  import WhatWeDo from '$lib/components/WhatWeDo.svelte';
</script>


<section class="py-16 px-4 md:px-0 max-w-7xl mx-auto">

  

  <section class="text-center mb-14 h-[580px] mx-auto">
    <p class="text-sm text-gray-700 max-w-2xl mx-auto uppercase">Enterprise optimization at scale</p>
    <h1 class="text-4xl sm:text-7xl font-normal w-[100%] pb-12 leading-tight tracking-tight mx-auto text-center font-inter">
        <span class="word-cycle" style="min-width: 140px;">
           <span class="chroma-text text-right" data-text="Audit">Audit</span>
           <span class="chroma-text text-right" data-text="Score">Score</span>
           <span class="chroma-text text-right" data-text="Boost">Boost</span>
         </span> your job postings 
         <!-- What's your job post's ReachScore? -->
       </h1>
       <p class="text-base sm:text-lg text-gray-500 text-center mb-12 max-w-2xl mx-auto font-normal">
        Your <b class="text-black">ReachScore <sup class="text-xs">™</sup></b> is the key to connecting with the 70% of qualified candidates you're currently missing.
      </p>
  </section>

  <section class="text-left mb-14"> <h1 class="text-5xl  mb-4 bg-gradient-to-r from-blue-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent" style="-webkit-background-clip: text; -webkit-text-fill-color: transparent; color: transparent;">Enterprise optimization at scale</h1>
    <p class="text-lg text-gray-700 max-w-2xl">Where ReachScore makes the biggest impact for high-performing organizations.</p>
  </section>

<!-- What We Do Section -->
<WhatWeDo />

  <div class="grid gap-8 md:grid-cols-3">
    <!-- Executive Search -->
    <Card class="flex flex-col items-start p-6 h-full">
      <h2 class="font-bold text-lg mb-2">Executive search</h2>
      <p class="text-gray-600 text-sm mb-3">ReachScore analyzes your leadership role posts and shows you specific improvements that help these critical positions get discovered by qualified candidates.</p>
    </Card>
    <!-- Volume Hiring -->
    <Card class="flex flex-col items-start p-6 h-full">
      <h2 class="font-bold text-lg mb-2">Volume hiring</h2>
      <p class="text-gray-600 text-sm mb-3">ReachScore ensures consistent quality across hundreds of posts, helping regional recruiters maintain optimization standards without manual oversight.</p>
    </Card>
    <!-- Competitive Positioning -->
    <Card class="flex flex-col items-start p-6 h-full">
      <h2 class="font-bold text-lg mb-2">Competitive positioning</h2>
      <p class="text-gray-600 text-sm mb-3">ReachScore shows you exactly how your job posts compare to market standards, revealing opportunities to stand out in competitive talent markets.</p>
    </Card>
  </div>
  <div class="mt-16 grid gap-8 md:grid-cols-2">
    <Card class="p-6 flex flex-col gap-4">
      <h3 class="font-semibold text-xl mb-2">Enterprise optimization at scale</h3>
      <ul class="space-y-2 text-gray-700 text-sm">
        <li><b>Team dashboards</b> — Track ReachScore performance across all departments</li>
        <li><b>ATS integration</b> — Analyze posts directly from Workday, SuccessFactors, and major platforms</li>
        <li><b>Consistency reporting</b> — Ensure optimization standards across global operations</li>
        <li><b>Benchmark insights</b> — See how your posts score against industry best practices</li>
      </ul>
      <button class="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">Book Strategic Demo</button>
    </Card>
    <Card class="p-6 flex flex-col gap-4 justify-between">
      <h3 class="font-semibold text-xl mb-2">Your competitive edge in talent acquisition</h3>
      <p class="text-gray-700 text-sm">While other companies guess at job post quality, you'll know exactly what works.</p>
      <p class="text-gray-700 text-sm">Industry data shows optimized job posts increase visibility by up to 70%. ReachScore shows you exactly how to achieve that optimization.</p>
      <button class="mt-4 px-6 py-2 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white rounded font-semibold hover:opacity-90 transition">Get Your Organization's ReachScore</button>
    </Card>
  </div>
</section>

<style lang="scss">
    .chroma-text {
      background-image:linear-gradient(90deg,#000000 0,#000000 33.33%,#c679c4 40%,#fa3d1d 45%,#ffb005 50%,#e1e1fe 55%,#0358f7 60%,transparent 66.67%,transparent); 
      background-size: 300% 100%;
      background-position: 100% 0;
      will-change: background-position;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      /* Deep fallback if gradient text isn't supported */
      @supports not (background-clip: text) {
        color: #000;
      }
    }
  
    .word-cycle {
      display: inline-grid;
      text-align: right;
  
      position: relative;
    }
  
    .word-cycle > span {
      grid-area: 1 / 1;
      opacity: 0;
      animation-name: word-cycle, chroma-sweep;
      animation-duration: 9s;
      animation-iteration-count: infinite;
      animation-fill-mode: forwards;
      transition: opacity 1s ease-in-out;
    }

    .word-cycle > span:nth-child(1) {
      animation-delay: 0s;
    }
    .word-cycle > span:nth-child(2) {
      animation-delay: 3s;
    }
    .word-cycle > span:nth-child(3) {
      animation-delay: 6s;
    }
  
    @keyframes word-cycle {
      /* Slow fade in, long visible period, slow fade out */
      0% { opacity: 0; }
      5% { opacity: 0.3; }
      10% { opacity: 0.6; }
      15% { opacity: 1; }
      65% { opacity: 1; }
      75% { opacity: 0.6; }
      85% { opacity: 0.3; }
     
    }
  
    @keyframes chroma-sweep {
      /* Handles the gradient sweep for one word over a 9s cycle */
      0%, 3% {
        background-position: 100% 0;
        filter: blur(1px);
      }
      /* SLOWED DOWN: Sweep now happens between 3% and 12% */
      16% {
        background-position: 0% 0;
        filter: blur(0);
      }
      30% {
        background-position: 0% 0;
        filter: blur(0);
      }
      30.01%, 100% {
        background-position: 100% 0;
        filter: blur(1px);
      }
    }
  </style>
  