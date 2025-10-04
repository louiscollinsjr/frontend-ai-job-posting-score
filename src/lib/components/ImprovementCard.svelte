<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  interface ImprovementItem {
    impact: string;
    summary?: string;
    description?: string;
    reasoning?: string;
  }

  export let improvement: ImprovementItem = {} as ImprovementItem;
  
  const dispatch = createEventDispatcher();
  
  function handleFix() {
    dispatch('fix', improvement);
  }
  
  $: impactColor = improvement.impact === 'High Impact' ? 'text-red-600 bg-red-50' : 
                   improvement.impact === 'Medium Impact' ? 'text-yellow-600 bg-yellow-50' : 
                   'text-gray-600 bg-gray-50';
  
  $: impactIcon = improvement.impact === 'High Impact' ? '🔴' : 
                  improvement.impact === 'Medium Impact' ? '🟡' : '⚪';
</script>

<div class="p-2 px-4">
  <div class="">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- <div class="flex items-center gap-2 mb-2"> -->
          <!-- <h4 class="font-medium text-gray-900">{improvement.category}</h4>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {impactColor}">
            {improvement.impact}
          </span> -->
          <!-- <span class="text-xs text-green-600 font-medium">{improvement.scoreContribution}</span> -->
        <!-- </div> -->
        <li class="text-sm text-gray-600">{improvement.summary || improvement.description}</li>
        {#if improvement.reasoning}
          <p class="text-sm text-gray-500 mt-1 italic">{improvement.reasoning}</p>
        {/if}
      </div>
      
      <!-- <Button 
        size="sm" 
        variant="outline" 
        class="text-xs ml-4"
        on:click={handleFix}
      >
        Fix This
      </Button> -->
    </div>
    
    <!-- Before/After Comparison -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> -->
      <!-- Before -->
      <!-- <div class="space-y-2">
        <div class="flex items-center text-xs font-medium text-red-600">
          <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          BEFORE
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-gray-700 italic">"{improvement.beforeText}"</p>
          <div class="text-xs text-red-600 mt-2">
            {improvement.category === 'Job Title Clarity' ? 'Generic title lacks location and work model' :
             improvement.category === 'Compensation Transparency' ? 'No specific compensation details' :
             improvement.category === 'Required Skills' ? 'Vague requirements make screening difficult' :
             improvement.category === 'Location & Remote Policy' ? 'Work arrangement unclear' :
             'Previous content was less specific'}
          </div>
        </div>
      </div>
       -->
      <!-- After -->
      <!-- <div class="space-y-2">
        <div class="flex items-center text-xs font-medium text-green-600">
          <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          AFTER
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-3">
          <p class="text-sm text-gray-700 font-medium">"{improvement.afterText}"</p>
          <div class="text-xs text-green-600 mt-2">
            {improvement.category === 'Job Title Clarity' ? 'Clear authority, location, and remote policy' :
             improvement.category === 'Compensation Transparency' ? 'Clear salary range builds trust and attracts qualified candidates' :
             improvement.category === 'Required Skills' ? 'Specific qualifications improve candidate fit' :
             improvement.category === 'Location & Remote Policy' ? 'Remote policy attracts wider talent pool' :
             'Enhanced with specific details and clarity'}
          </div>
        </div>
      </div> -->
    <!-- </div> -->
  </div>
</div>
