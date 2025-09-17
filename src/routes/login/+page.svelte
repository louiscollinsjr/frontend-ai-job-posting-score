<script>
  import MagicLinkLogin from '$lib/components/MagicLinkLogin.svelte';
</script>

<div class="flex flex-col items-center justify-center h-full px-4">
  <div class="w-full max-w-md">
    <!-- Logo at the top -->
    <!-- <div class="text-center mb-10">
      <a href="/" class="inline-block">
        <span class="text-3xl font-bold text-gray-900">JobPost<b>Score</b> <sup class=" hidden text-xs align-super">™</sup></span>
      </a>
      <p class="mt-2 text-sm text-gray-600">AI-powered job posting audit tool</p>
    </div> -->
    
    <!-- Login card -->
    <div class="rounded-2xl border border-gray-800 border-b-2 border-r-2 p-6 bg-gray-50">
     
      <MagicLinkLogin />
      
      <div class="my-6 text-center">
        <p class="text-xs text-gray-500">Having trouble signing in? <a href="/" class="text-teal-500 font-medium hover:underline">Contact us</a></p>
      </div>
    </div>
    
  </div>
</div>
