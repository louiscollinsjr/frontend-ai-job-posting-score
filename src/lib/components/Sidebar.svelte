<script>
  import { onMount } from 'svelte';
  
  // State for mobile menu toggle
  let isMobileMenuOpen = false;
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
  
  // Close mobile menu when clicking outside
  function handleOutsideClick(event) {
    if (isMobileMenuOpen && !event.target.closest('.sidebar-nav')) {
      isMobileMenuOpen = false;
    }
  }
  
  // Add event listener for outside clicks on mobile
  onMount(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  });
</script>

<div class="sidebar-container">
  <!-- Mobile Menu Button - Simple Text Toggle -->
  <button 
    class="md:hidden fixed top-4 left-4 z-30 p-2 bg-white text-black border border-gray-200 rounded" 
    on:click|stopPropagation={toggleMobileMenu}
    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    aria-expanded={isMobileMenuOpen}
  >
    {isMobileMenuOpen ? 'Close' : 'Menu'}
  </button>

  <!-- Sidebar Nav - Fixed on desktop, slide-in on mobile -->
  <nav 
    class="sidebar-nav fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-20 w-full md:w-1/5 lg:w-1/5 transition-transform duration-300 transform flex flex-col justify-between
           {isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
  >
    <!-- Logo Section -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center">
        <span class="text-2xl font-medium text-gray-800">AI Job Score</span>
      </div>
    </div>
    
    <!-- Navigation Links - Simple and Clean -->
    <div class="mt-6 px-6 flex-grow">
      <ul class="space-y-5">
        <li>
          <a href="/" class="block py-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium">
            Home
          </a>
        </li>
        <li>
          <a href="/how-it-works" class="block py-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium">
            How It Works
          </a>
        </li>
        <li>
          <a href="/features" class="block py-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium">
            Features
          </a>
        </li>
        <li>
          <a href="/pricing" class="block py-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium">
            Pricing
          </a>
        </li>
        <li>
          <a href="/contact" class="block py-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium">
            Contact Us
          </a>
        </li>
      </ul>
    </div>
    
    <!-- Footer with Copy and Social Icons -->
    <div class="p-6 border-t border-gray-100">
      <p class="text-sm text-gray-500 mb-4">
        We help you optimize your job postings for better candidate engagement and higher quality applications.
      </p>
      
      <!-- Social Icons -->
      <div class="flex space-x-4 mt-4">
        <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
          <!-- Twitter/X Icon -->
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </a>
        <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
          <!-- LinkedIn Icon -->
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </a>
        <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
          <!-- GitHub Icon -->
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
      </div>
      
      <!-- Copyright -->
      <div class="mt-4 text-xs text-gray-400">
        © {new Date().getFullYear()} AI Job Score. All rights reserved.
      </div>
    </div>
  </nav>
</div>

<style>
  /* Ensure the sidebar does not cause horizontal overflow */
  .sidebar-container {
    overflow-x: hidden;
  }
  
  /* Prevent body scroll when mobile menu is open */
  :global(body.menu-open) {
    overflow: hidden;
  }
</style>
