<script>
  import MagicLinkLogin from '$lib/components/MagicLinkLogin.svelte';
</script>

<div class="flex flex-col items-center justify-center h-full px-4">
  <div class="w-full max-w-md">
    
    <!-- Login card -->
    <div class="rounded-2xl border border-gray-800 border-b-2 border-r-2 p-6 ">
     
      <MagicLinkLogin />
      
      <div class="my-6 text-center">
        <p class="text-xs text-gray-500">Having trouble signing in? <a href="/" class="text-teal-500 font-medium hover:underline">Contact us</a></p>
      </div>
    </div>
    
  </div>
</div>