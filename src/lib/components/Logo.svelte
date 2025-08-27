<script lang="ts">
  // Props
  export let variant: 'black' | 'white' = 'black';
  // If href is provided, the logo will be wrapped in an anchor tag
  export let href: string | null = null;
  export let alt: string = 'JobPostScore Logo';

  // Classes
  // Applies to the <a> wrapper when href is provided
  export let containerClass: string = 'flex-shrink-0 flex items-center';
  // Applies to the <img> element in all cases
  export let imgClass: string = 'h-6 sm:h-8 w-auto object-contain';

  // Inline styles to preserve crisp rendering
  export let style: string = 'image-rendering: crisp-edges; shape-rendering: geometricPrecision;';

  $: src = variant === 'white' ? '/jobpostscore_logo_white.svg' : '/jobpostscore_logo.svg';
</script>

{#if href}
  <a href={href} class={containerClass} aria-label={alt}>
    <img src={src} alt={alt} class={imgClass} style={style} />
  </a>
{:else}
  <img src={src} alt={alt} class={imgClass} style={style} />
{/if}
