<script lang="ts">
  import '../app.css';
  // Import variable fonts with all weights and styles
  import '@fontsource-variable/playfair-display';
  import '@fontsource-variable/roboto';
  import '@fontsource-variable/quicksand';
  import '@fontsource-variable/geist';
  import '@fontsource-variable/inter';
  import '../lib/font-test.css';
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import Navbar from '$lib/components/Navbar.svelte';

  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { page } from '$app/stores';
  
  let { children } = $props();
  
  // Check if current route is login or auth callback using $derived (Svelte 5 syntax)
  let isLoginRoute = $derived($page?.route?.id === '/login' || $page?.route?.id?.startsWith('/auth/'));
  
  // Check if current route is results page
  let isResultsRoute = $derived($page?.route?.id === '/results' || $page?.route?.id?.startsWith('/results/'));
  
  onMount(() => {
    // Initialize the user auth store
    user.init();
  });
</script>

{#if isLoginRoute}
  <Navbar justLogo={true} />
  <div class="flex flex-col h-screen w-full overflow-hidden">
    <main class="bg-white w-full mx-auto flex-grow overflow-auto">
      {@render children?.()}
    </main>
  </div>
{:else}
  <Sidebar.Provider>
    <div class="flex flex-col min-h-screen w-full max-w-[1600px] mx-auto">
      <Navbar hideLoginButton={isLoginRoute || isResultsRoute} justLogo={false} />
      
      <!-- Empty space to offset the fixed navbar -->
      <div class="h-16"></div>
      
      <!-- Main content area with sidebar -->
      <div class="flex flex-grow w-full">
        <!-- Sidebar navigation -->
        <AppSidebar />
        
        <main class="max-w-[1600px] mt-8 px-4">
          <!-- Main content -->
          {@render children?.()}
        </main>
      </div>
    </div>
  </Sidebar.Provider>
{/if}

