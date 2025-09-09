<!-- src/lib/components/Card_EveryWordMatters.svelte -->
<script>
    import Logo from '$lib/components/Logo.svelte';
</script>

 <div class="w-full h-full rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 bg-gradient-to-br from-[#c3cde1] to-[#dde3ee]">
    <!-- Mock Browser Window -->
    <div class="flex h-full flex-col overflow-hidden rounded-xl bg-white/60 shadow-inner">
      <!-- Browser Chrome (header) -->
      <div class="flex flex-shrink-0 items-center gap-2 border-none border-gray-200 bg-white/30 px-4 py-2.5">
        <div class="h-3 w-3 rounded-full bg-red-400"></div>
        <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
        <div class="h-3 w-3 rounded-full bg-green-400"></div>
      </div>
  
      <!-- Main Content Area -->
      
      <div class="flex flex-grow flex-col justify-between bg-white/30 p-5">
        <!-- Input Area -->
        <div class="flex-grow rounded-lg border border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-700">
          <p class="font-semibold text-gray-900 text-xs mt-3">Account Director, Digital Natives</p>
          <p class="mt-2 text-gray-600 text-xs">
            Our Sales team has a unique mission to help customers understand the deep impact that highly capable AI models can bring to their business and users. This role is a mixture of technical understanding, vision, partnership, and value-driven strategy.
            <!-- Blinking Cursor -->
            <span class="cursor"></span>
          </p>
        </div>
  
        <!-- Action Button -->
        <div class="mt-4 flex justify-center">
          <div class="glow-button flex w-full max-w-[80%] items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm relative overflow-hidden">
            <!-- Sparkle Icon for "AI" or "Analysis" -->
            <span>Get</span>
            <Logo variant="white" imgClass="h-3 w-auto sm:h-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <style>
    .glow-button {
      position: relative;
      border: 2px solid transparent;
      background-clip: padding-box;
      box-shadow: 0 0 10px rgba(255,255,255,0.3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .glow-button::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background: linear-gradient(
        45deg,
        #c679c4,
        #fa3d1d,
        #ffb005,
        #e1e1fe,
        #0358f7,
        #c679c4
      );
      background-size: 400% 400%;
      z-index: -1;
      border-radius: 9999px;
      animation: glow 4s linear infinite;
      filter: blur(4px);
      opacity: 0.9;
    }

    @keyframes glow {
      0% {
        background-position: 0% 0%;
        filter: blur(4px) brightness(1.2);
      }
      50% {
        background-position: 100% 50%;
        filter: blur(6px) brightness(1.5);
      }
      100% {
        background-position: 0% 0%;
        filter: blur(4px) brightness(1.2);
      }
    }

    .glow-button > * {
      position: relative;
      z-index: 1;
    }

    .cursor {
      display: inline-block;
      width: 2px;
      height: 1em;
      background-color: #3b82f6; /* blue-600 */
      margin-left: 2px;
      animation: blink 1s steps(1) infinite;
      transform: translateY(0.15em); /* Better vertical alignment */
    }
  
    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
  </style>