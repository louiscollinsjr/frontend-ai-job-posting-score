<script>
  import AppSidebar from "./app-sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  
  // Props
  export let hideLoginButton = false;
  export let justLogo = false;
  
  let isLoggedIn = false;
  let userEmail = '';
  
  onMount(() => {
    // Initialize the user store
    user.init();
  });
  
  // Subscribe to user changes
  $: if ($user) {
    isLoggedIn = true;
    userEmail = $user.email;
  } else {
    isLoggedIn = false;
    userEmail = '';
  }
  
  async function handleLogout() {
    await user.signOut();
  }
</script>

<nav class="w-full fixed top-0 left-0 z-50 backdrop-blur-md bg-white/50 border-none border-gray-200/50">
  <div class="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo and sidebar trigger -->
      <div class="flex items-center">
        
        
        <a href="/" class="flex-shrink-0 flex items-center">
          <span class="text-2xl text-black"><b class="">JobPostScore</b> <sup class="hidden text-xs align-super">™</sup></span>
        </a>

        {#if !justLogo}
          {#if !hideLoginButton}
            <Sidebar.Trigger class="ml-6 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </Sidebar.Trigger>
          {/if}
        {/if}
      </div>
   
    
    <!-- Navigation Links - Desktop -->
    <div class="hidden md:flex items-center space-x-8">
      <!-- <a href="/how-it-works" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
      <a href="/use-cases" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Use cases</a>
      <a href="/pricing" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
      <a href="/help" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Help</a>
      <a href="/careers" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Careers</a> -->
    </div>
    
    <!-- Auth Buttons -->
    <div class="flex items-center space-x-4">
      {#if !justLogo}
        {#if !hideLoginButton}
          {#if isLoggedIn}
            <div class="flex items-center gap-4">
              <a href="/dashboard" class="text-sm font-medium text-gray-700 hover:text-gray-900">Dashboard</a>
              <button 
                on:click={handleLogout} 
                class="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
              >
                <span>Log out</span>
              </button>
              <!-- <div class="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {userEmail ? userEmail.split('@')[0] : ''}
              </div> -->
            </div>
          {:else}
            <a href="/login" class="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-black bg-gray-100 rounded-full hover:bg-gray-800 hover:text-white transition-colors tracking-wide">
              Log in
            </a>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
</nav>
