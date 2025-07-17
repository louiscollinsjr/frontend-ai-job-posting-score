<script>
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { user } from '$lib/stores/auth.js';
  import { page } from '$app/stores';

  // Menu items.
  const items = [
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
    {
      title: "For Enterprise",
      url: "/enterprise",
      disabled: false
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      disabled: !$user
    },
    {
      title: "News",
      url: "/news",
      disabled: false
    }
  ];
  
  // Social media links
  const socialLinks = [
    { name: "Twitter", url: "#", icon:"X"},
    { name: "LinkedIn", url: "#", icon: "in" }
  ];
</script>

<Sidebar.Root class="bg-white border-none mt-16">
  <Sidebar.Content class="bg-white border-none flex flex-col h-full overflow-y-auto">
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
    <Sidebar.Footer class="bg-white">
      
    <!-- Footer with site purpose and links -->
    <div class="mt-20 px-6 pb-20">
      <!-- Site purpose description -->
      <p class="text-[11px] font-light text-gray-400 mb-6">
        We're here to help you create inclusive job postings that reach the widest possible talent pool. JobPostScore helps you audit your job descriptions for bias and improve your hiring outcomes.
      </p>
      
      <!-- Social links -->
      <div class="flex space-x-4 mb-4">
        {#each socialLinks as link}
          <a href={link.url} class="text-gray-500 hover:text-gray-700">
            <span>{link.icon}</span>
          </a>
        {/each}
      </div>
      
      <!-- Legal links -->
      <div class="text-[10px] text-gray-400">
        <a href="javascript:void(0)" class="block mb-2 hover:underline">Terms and conditions</a>
        <a href="javascript:void(0)" class="block mb-10 hover:underline">Privacy Policy</a>
      </div>
    </div>
    </Sidebar.Footer>
 
</Sidebar.Root>
