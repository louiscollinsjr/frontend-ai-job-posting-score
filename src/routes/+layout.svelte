<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  let { children } = $props();
</script>

<div class="flex min-h-screen bg-gray-50">
  <!-- Sidebar navigation -->
  <Sidebar />
  
  <!-- Main content area -->
  <main class="flex-1 ml-0 md:ml-[20%] lg:ml-[20%] p-4 md:p-8">
    {@render children()}
  </main>
</div>
