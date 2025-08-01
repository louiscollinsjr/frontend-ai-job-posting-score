<script lang="ts">
  import { useCarousel } from './use-carousel'
  
  export let opts: any
  export let class: string = ''
  
  const { carouselState, carouselActions } = useCarousel(opts)
</script>

<div 
  class={`relative ${class}`}
  use:carouselActions
  bind:this={carouselState.carousel}
>
  <slot />
</div>
