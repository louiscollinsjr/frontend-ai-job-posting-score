<!-- src/lib/components/CardC_Video.svelte -->
<div class="w-full h-full rounded-2xl bg-gray-50/50 p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80">
    <div class="relative h-full w-full overflow-hidden rounded-xl bg-blue-200">
      <!-- Background Image -->
      <img src="https://images.unsplash.com/photo-1580894742597-879895245399?q=80&w=1740&auto=format&fit=crop" alt="Architectural design video call" class="absolute inset-0 h-full w-full object-cover"/>
      <!-- Blue decorative shape -->
      <div class="absolute -top-10 -right-20 h-48 w-72 bg-blue-500/80 rounded-full blur-3xl"></div>
  
      <!-- Content Overlay -->
      <div class="relative z-10 flex h-full flex-col justify-between p-4 text-white">
        <!-- Top AI Response Box (Translucent) -->
        <div class="w-full max-w-sm mx-auto rounded-lg bg-black/10 backdrop-blur-md p-3 border border-white/20">
          <p class="text-xs font-semibold mb-2 text-white/80">✦ AI Response</p>
          <div class="space-y-1.5">
            <div class="h-2 w-3/4 rounded-full bg-white/40"></div>
            <div class="h-2 w-full rounded-full bg-white/40"></div>
            <div class="h-2 w-1/2 rounded-full bg-white/40"></div>
          </div>
        </div>
        
        <!-- Bottom Controls -->
        <div class="space-y-3">
          <div class="max-w-md mx-auto rounded-lg bg-black/20 backdrop-blur-md px-3 py-2 text-xs border border-white/20">
            Let's start simple: what makes a space feel comfortable and beautiful at the same time?
          </div>
          <div class="rounded-lg bg-white/80 backdrop-blur-md p-2 flex justify-center items-center gap-2">
              <button class="bg-white rounded p-2 text-gray-700 text-xs shadow">⌘ command</button>
              <button class="bg-white rounded p-2 text-gray-700 shadow">+</button>
              <button class="bg-white rounded p-2 text-gray-700 shadow">↑</button>
              <button class="bg-white rounded p-2 text-gray-700 shadow">↓</button>
              <button class="bg-white rounded p-2 text-gray-700 shadow">←</button>
              <button class="bg-white rounded p-2 text-gray-700 shadow">→</button>
          </div>
        </div>
      </div>
    </div>
  </div>