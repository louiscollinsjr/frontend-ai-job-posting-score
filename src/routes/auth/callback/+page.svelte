<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/stores/auth.js';
  
  let error = null;
  
  onMount(async () => {
    // Get the URL hash
    const hash = window.location.hash;
    
    if (hash && hash.includes('access_token')) {
      try {
        // Process the callback URL with Supabase
        const { data, error: authError } = await supabase.auth.setSession({
          access_token: hash.split('access_token=')[1].split('&')[0],
          refresh_token: hash.split('refresh_token=')[1].split('&')[0],
        });
        
        if (authError) {
          error = authError.message;
        } else {
          // Redirect to dashboard on successful authentication
          goto('/dashboard');
        }
      } catch (err) {
        error = 'Failed to process authentication. Please try again.';
        console.error('Auth callback error:', err);
      }
    } else {
      // If no hash with tokens, redirect to login
      goto('/login');
    }
  });
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-md">
    <!-- Logo at the top -->
    <div class="text-center mb-10">
      <a href="/" class="inline-block">
        <span class="text-3xl font-bold text-gray-900">Reach<b>Score</b> <sup class="text-xs align-super">™</sup></span>
      </a>
      <p class="mt-2 text-sm text-gray-600">AI-powered job posting audit tool</p>
    </div>
    
    <!-- Auth card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      {#if error}
        <div class="text-red-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="font-semibold text-xl">Authentication Error</p>
          <p class="text-sm mt-2">{error}</p>
        </div>
        <a href="/login" class="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          Return to Login
        </a>
      {:else}
        <div class="flex flex-col items-center py-6">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
          <p class="text-gray-700 font-medium">Signing you in...</p>
          <p class="text-sm text-gray-500 mt-2">You'll be redirected to your dashboard shortly.</p>
        </div>
      {/if}
    </div>
    
    <!-- Footer links -->
    <div class="mt-8 text-center">
      <div class="flex justify-center space-x-4 text-xs text-gray-500">
        <a href="/" class="hover:text-gray-700">Home</a>
        <a href="/pricing" class="hover:text-gray-700">Pricing</a>
        <a href="/" class="hover:text-gray-700">Terms</a>
        <a href="/" class="hover:text-gray-700">Privacy</a>
      </div>
      <p class="mt-4 text-xs text-gray-400">© 2025 ReachScore. All rights reserved.</p>
    </div>
  </div>
</div>
