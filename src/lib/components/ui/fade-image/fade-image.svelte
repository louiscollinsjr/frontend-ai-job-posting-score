<script>
  export let src;
  export let alt = '';
  export let fadeDirection = 'bottom'; // Options: 'bottom', 'top', 'left', 'right'
  export let fadeIntensity = 'medium'; // Options: 'none', 'light', 'medium', 'strong'
  export let className = ''; // Additional classes
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

<script context="module">
  function getMaskGradient(direction, intensity) {
    // No fade if intensity is 'none'
    if (intensity === 'none') {
      return 'none';
    }
    
    // Define gradient stops based on intensity
    const gradientStops = {
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
      ]
    };
    
    // Get the appropriate gradient stops for the selected intensity
    const stops = gradientStops[intensity] || gradientStops.medium;
    
    // Create gradient based on direction
    const gradientMap = {
      bottom: `linear-gradient(to bottom, ${stops.join(', ')})`,
      top: `linear-gradient(to top, ${stops.join(', ')})`,
      left: `linear-gradient(to left, ${stops.join(', ')})`,
      right: `linear-gradient(to right, ${stops.join(', ')})`,
    };
    
    return gradientMap[direction] || gradientMap.bottom;
  }
</script>
