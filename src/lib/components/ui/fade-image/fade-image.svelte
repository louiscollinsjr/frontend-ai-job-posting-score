<script lang="ts" context="module">
  export type FadeDirection = 'bottom' | 'top' | 'left' | 'right';
  export type FadeIntensity = 'none' | 'light' | 'medium' | 'strong';
</script>

<script lang="ts">

  const gradientStops: Record<FadeIntensity, string[]> = {
    light: [
      'rgba(0,0,0,1) 0%', 
      'rgba(0,0,0,0.9) 50%', 
      'rgba(0,0,0,0) 100%'
    ],
    medium: [
      'rgba(0,0,0,1) 0%', 
      'rgba(0,0,0,0.7) 50%', 
      'rgba(0,0,0,0) 100%'
    ],
    strong: [
      'rgba(0,0,0,1) 0%', 
      'rgba(0,0,0,0.2) 50%', 
      'rgba(0,0,0,0) 100%'
    ],
    none: []
  };

  const gradientMap: Record<FadeDirection, (stops: string[]) => string> = {
    bottom: (stops: string[]) => `linear-gradient(to bottom, ${stops.join(', ')})`,
    top: (stops: string[]) => `linear-gradient(to top, ${stops.join(', ')})`,
    left: (stops: string[]) => `linear-gradient(to left, ${stops.join(', ')})`,
    right: (stops: string[]) => `linear-gradient(to right, ${stops.join(', ')})`
  };

  export function getMaskGradient(direction: FadeDirection, intensity: FadeIntensity): string {
    if (intensity === 'none') {
      return 'none';
    }

    const stops = gradientStops[intensity];
    return gradientMap[direction](stops);
  }

  export let src: string;
  export let alt = '';
  export let fadeDirection: FadeDirection = 'bottom';
  export let fadeIntensity: FadeIntensity = 'medium';
  export let className = '';
</script>

<div class="relative w-full h-full overflow-hidden {className}">
  <img 
    {src} 
    {alt}
    class="w-full h-full object-cover"
    style="mask-image: {getMaskGradient(fadeDirection, fadeIntensity)}; 
           -webkit-mask-image: {getMaskGradient(fadeDirection, fadeIntensity)};"
  />
</div>
