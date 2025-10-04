<script lang="ts">
  import { useCarousel } from './use-carousel'
  
  export let opts: any
  export let className: string = ''
  
  const { carouselState } = useCarousel(opts)
  let carouselElement: HTMLElement | null = null
  
  $: if (carouselElement) {
    carouselState.carousel.set(carouselElement)
  }
</script>

<div 
  class={`relative ${className}`}
  bind:this={carouselElement}
>
  <slot />
</div>
