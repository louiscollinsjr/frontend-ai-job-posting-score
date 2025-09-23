<!-- src/lib/Container.svelte -->
<script>
    export let className = '';
  </script>
  
  <div class={`container mx-auto max-w-8xl px-4 ${className}`}>
    <slot />
  </div>