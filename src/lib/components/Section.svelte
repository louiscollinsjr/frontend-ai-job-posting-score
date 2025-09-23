<!-- src/lib/Section.svelte -->
<script>
    import Container from './Container.svelte';
    export let className = '';
    export let containerClass = '';
  </script>
  
  <section class={`sm:my-24 my-4 sm:mt-32 ${className}`}>
    <Container className={containerClass}>
      <slot />
    </Container>
  </section>