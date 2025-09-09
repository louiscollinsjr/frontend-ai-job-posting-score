<!-- src/lib/components/CardA_Meeting.svelte -->
<div class="w-full h-full rounded-2xl bg-gray-50/50 p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80">
    <!-- Inner card with gradient -->
    <div class="rounded-xl bg-gradient-to-b from-white/70 to-[#F9FAFB] p-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium tracking-tight text-gray-800">
          Meeting participants <span class="text-xs text-gray-500">(4)</span>
        </h2>
        <div class="flex items-center gap-1.5 rounded-md bg-[#EAEDF5] px-2 py-1 text-xs font-medium text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" class="fill-[#42DB7F]">
            <path d="M10.5 1.5C9.055 1.5 7.689 1.229 6.201 0.632L6 0.552L5.799 0.632C4.311 1.229 2.945 1.5 1.5 1.5H1V5.1C1 9.444 5.8425 10.48 5.8915 10.489L6 10.511L6.1085 10.489C6.1575 10.48 11 9.444 11 5.1V1.5H10.5ZM5.14 7.522L3.293 5.875L4 5.238L5.11 6.248L7.9705 3.438L8.7065 4.055L5.14 7.522Z" />
          </svg>
          <span>No bots detected</span>
        </div>
      </div>
  
      <!-- Participants List -->
      <div class="mt-2 divide-y divide-gray-200/70">
        <!-- Participant Row -->
        <div class="flex items-center gap-3 py-2.5">
          <img alt="Gina Huels" class="h-8 w-8 shrink-0 rounded-full" src="https://i.pravatar.cc/40?u=gina" />
          <div class="flex-1">
            <p class="text-sm font-medium leading-snug tracking-tight text-gray-900">Gina Huels <span class="text-xs text-gray-500">(You)</span></p>
            <p class="text-xs leading-snug tracking-tight text-gray-500">ginahue65@cluely.com</p>
          </div>
          <span class="text-xs font-medium leading-snug tracking-tight text-gray-600">Owner</span>
        </div>
        <!-- Add other participants similarly -->
        <div class="flex items-center gap-3 py-2.5">
          <img alt="Todd Cremin" class="h-8 w-8 shrink-0 rounded-full" src="https://i.pravatar.cc/40?u=todd" />
          <div class="flex-1">
            <p class="text-sm font-medium leading-snug tracking-tight text-gray-900">Todd Cremin</p>
            <p class="text-xs leading-snug tracking-tight text-gray-500">todd.cremin@cluely.com</p>
          </div>
          <span class="flex items-center gap-0.5 text-xs font-medium leading-snug tracking-tight text-gray-900">Speaker<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-500"><path d="m6 9 6 6 6-6"></path></svg></span>
        </div>
         <!-- ... more participants -->
      </div>
    </div>
  </div>