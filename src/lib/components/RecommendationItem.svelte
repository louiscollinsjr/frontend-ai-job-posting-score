<script lang="ts">
  type SeverityLevel = 'low' | 'medium' | 'high';

  export let category = '';
  export let message = '';
  export let severity: SeverityLevel = 'medium'; // 'low', 'medium', 'high'
  export let suggestion = '';
  
  const severityConfig: Record<SeverityLevel, { bg: string; border: string; icon: string; color: string }> = {
    low: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      icon: '💡',
      color: 'text-blue-700'
    },
    medium: { 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200', 
      icon: '⚠️',
      color: 'text-yellow-700'
    },
    high: { 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      icon: '🚨',
      color: 'text-red-700'
    }
  };
  
  $: config = severityConfig[severity] || severityConfig.medium;
</script>

<div class="recommendation-item {config.bg} {config.border} border rounded-lg p-3 transition-all hover:shadow-sm">
  <div class="flex items-start gap-3">
    <span class="text-lg flex-shrink-0">{config.icon}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="font-medium text-sm {config.color}">{category}</span>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white border {config.border}">
          {severity}
        </span>
      </div>
      
      <p class="text-sm text-gray-700 mb-2">{message}</p>
      
      {#if suggestion}
        <div class="bg-white border {config.border} rounded p-2 text-xs">
          <span class="font-medium text-gray-600">Suggestion: </span>
          <span class="text-gray-700">{suggestion}</span>
        </div>
      {/if}
    </div>
  </div>
</div>
