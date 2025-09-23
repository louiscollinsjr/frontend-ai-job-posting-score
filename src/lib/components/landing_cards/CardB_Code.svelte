<!-- src/lib/components/CardB_Code.svelte -->
<div class="w-full h-full rounded-2xl bg-[#E0E7FF]/40 p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-indigo-200/50 relative overflow-hidden">
    <!-- Green outline to simulate "Visible to you" -->
    <div class="absolute inset-2 border-2 border-green-400 rounded-xl pointer-events-none"></div>
    
    <div class="flex justify-between mb-3 px-2">
      <div class="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm">Visible to you</div>
      <div class="rounded-md bg-gray-700 px-4 py-1.5 text-sm font-medium text-white">Invisible to others</div>
    </div>
  
    <!-- Fake Code Editor -->
    <div class="rounded-xl bg-white p-4 shadow-inner bg-gray-50/50">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-3">
          <div class="h-3 w-3 rounded-full bg-red-400"></div>
          <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
          <div class="h-3 w-3 rounded-full bg-green-400"></div>
      </div>
      <!-- AI Response Box -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-800 mb-4">
          <p><span class="font-semibold text-blue-600">AI Response:</span> Add a check for missing <code class="bg-blue-100 text-blue-700 px-1 rounded">user</code>. Also handle <code class="bg-blue-100 text-blue-700 px-1 rounded">data.name</code> safely.</p>
      </div>
      <!-- Fake Code -->
      <div class="font-mono text-xs text-gray-700 space-y-1">
        <p><span class="text-gray-400">1</span> <span class="text-gray-400">// Fetch data from API and display results</span></p>
        <p><span class="text-gray-400">2</span></p>
        <p><span class="text-gray-400">3</span> <span class="text-purple-500">import</span> axios <span class="text-purple-500">from</span> <span class="text-green-500">'axios'</span>;</p>
        <p><span class="text-gray-400">4</span></p>
        <p><span class="text-gray-400">5</span> <span class="text-blue-500">async function</span> <span class="text-yellow-500">fetchUserData</span>(userId) </p>
        <p><span class="text-gray-400">6</span> &nbsp;&nbsp;<span class="text-purple-500">try</span> </p>
        <p><span class="text-gray-400">7</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="h-2 w-32 bg-gray-200 rounded inline-block"></span></p>
        <p><span class="text-gray-400">8</span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="h-2 w-48 bg-gray-200 rounded inline-block"></span></p>
        <p><span class="text-gray-400">9</span> &nbsp;&nbsp;</p>
      </div>
    </div>
  </div>