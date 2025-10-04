<script lang="ts">
  type GaugeSize = 'sm' | 'md' | 'lg';

  export let score = 0;
  export let maxScore = 100;
  export let size: GaugeSize = 'md'; // 'sm', 'md', 'lg'
  export let showLabel = true;
  export let label = 'Score';
  
  $: percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  $: circumference = 2 * Math.PI * 40; // radius = 40
  $: strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizeClasses: Record<GaugeSize, string> = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  };
  
  const textSizeClasses: Record<GaugeSize, string> = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  const labelSizeClasses: Record<GaugeSize, string> = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm'
  };
  
  $: scoreColor = percentage >= 75 ? '#22c55e' : percentage >= 50 ? '#f59e0b' : '#ef4444';
</script>

<div class="flex flex-col items-center gap-2">
  <div class="relative {sizeClasses[size]}">
    <!-- SVG Circle Progress -->
    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
      <!-- Background circle -->
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        stroke="#e5e7eb" 
        stroke-width="8" 
        fill="none" 
      />
      <!-- Progress circle -->
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke={scoreColor}
        stroke-width="8"
        fill="none"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={strokeDashoffset}
        class="transition-all duration-1000 ease-out"
      />
    </svg>
    
    <!-- Score value overlay -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="font-bold {textSizeClasses[size]}" style="color: {scoreColor}">
        {Math.round(score)}
      </span>
      {#if size !== 'sm'}
        <span class="text-xs text-gray-500">/{maxScore}</span>
      {/if}
    </div>
  </div>
  
  {#if showLabel}
    <span class="font-medium text-gray-700 {labelSizeClasses[size]}">{label}</span>
  {/if}
</div>
