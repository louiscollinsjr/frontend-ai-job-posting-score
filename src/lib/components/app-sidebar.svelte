<script>
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { user } from '$lib/stores/auth.js';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Logo from '$lib/components/Logo.svelte';
  import { Linkedin } from '@lucide/svelte';
 
  
  // Track authentication state - default to false
  let isLoggedIn = false;
  
  // Initialize the user store on component mount
  onMount(() => {
    user.init();
    
    // Check immediately if user is already logged in
    isLoggedIn = !!$user;
  });
  
  // Reactive statement to update isLoggedIn when user changes
  $: {
    isLoggedIn = !!$user;
  }

  // Make the items array reactive to authentication state
  $: items = [
    {
      title: "Home",
      url: "/",
      disabled: false,
      hideOnCurrentPage: true
    },
    // {
    //   title: "How it works",
    //   url: "/how-it-works",
    //   disabled: false
    // },
    // {
    //   title: "Features",
    //   url: "#",
    //   disabled: false
    // },
    {
      title: "Pricing",
      url: "/pricing",
      disabled: false
    },
    // {
    //   title: "For Enterprise",
    //   url: "/enterprise",
    //   disabled: false
    // },
    {
      title: "Dashboard",
      url: "/dashboard",
      disabled: !isLoggedIn  // This will now update reactively when isLoggedIn changes
    },
    {
      title: "News",
      url: "/news",
      disabled: false
    }
  ];
  
  </script>

<Sidebar.Root class="border-none pt-16 print:hidden">
  <Sidebar.Content class="border-none flex flex-col h-full overflow-y-auto">
    <!-- Brand logo -->
    <div class="sm:hidden block pt-6 pl-6">
      <Logo href="/" imgClass="h-6 sm:h-8 w-auto object-contain" />
    </div>
    <!-- Navigation Menu -->
    <Sidebar.Group>
      <!-- <Sidebar.GroupLabel class="text-2xl text-black pt-10">Reach<b class="text-black">Score</b> <sup class=" hidden text-xs align-super">™</sup></Sidebar.GroupLabel>
       -->
      <Sidebar.GroupContent class="pt-12 pl-6">
        <Sidebar.Menu>
          {#each items as item}
            {#if !item.hideOnCurrentPage || $page.url.pathname !== item.url}
              <Sidebar.MenuItem class="mb-2">
                <Sidebar.MenuButton class="border-none">
                  {#snippet child({ props })}
                    {#if item.disabled}
                      <span class="text-xs font-medium cursor-not-allowed opacity-50">
                        {item.title}
                      </span>
                    {:else}
                      <a href={item.url} {...props} class="text-xs font-medium">
                        <span>{item.title}</span>
                      </a>
                    {/if}
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/if}
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
    <Sidebar.Footer class="bg-transparent">
      
    <!-- Footer with site purpose and links -->
    <div class="mt-20 px-6 pb-20">
      <!-- Site purpose description -->
      <p class="text-[11px] font-light text-gray-400 mb-6">
        Optimize your job postings for AI discovery. JobPostScore scores your listings, uncovers what limits reach, and gives clear steps to attract more qualified candidates who use AI to search for jobs. 
      </p>

      <div class="text-left text-xs text-white font-aeonik tracking-wide my-8 mx-0">
        <span class="inline-flex items-center rounded-full bg-gray-700 border-gray-500 uppercase tracking-widest px-3 py-[4px] mx-0 text-[10px]">Beta</span>
      </div>

      <!-- Social links -->
      <!-- <div class="flex space-x-4 mb-4 ml-1">
        <span class="text-gray-400 cursor-not-allowed" aria-label="Visit our X (Twitter) page">
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-1"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
        </span>
        <span class="text-gray-400 cursor-not-allowed" aria-label="Visit our LinkedIn page">
          <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        </span>
      </div>
       -->
      <!-- Legal links -->
      <div class="text-[10px] text-gray-400">
        <a href="/terms" class="block mb-2 hover:underline">Terms and conditions</a>
        <a href="/privacy" class="block mb-10 hover:underline">Privacy Policy</a>
      </div>
    </div>
    </Sidebar.Footer>
 
</Sidebar.Root>
