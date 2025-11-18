<script lang="ts" context="module">
  export interface ImprovementGroup {
    key: string;
    label: string;
    score: number;
    max: number;
    status: { label: string; badge: string };
    suggestions: string[];
  }
</script>

<script lang="ts">
  export let groups: ImprovementGroup[] = [];
  export let generalRecommendations: string[] = [];
</script>

<div class="my-10 print:mt-0 print:pt-8 print:w-full ">
  <!-- Header -->
  <div class="mb-4 border-b border-gray-200 pb-3 flex items-baseline gap-2 print:w-full">
    <h4 class="my-4 text-2xl font-bold text-gray-900">Suggested Improvements</h4>
    <!-- <p class="text-sm text-gray-600">Prioritized by opportunity</p> -->
  </div>

  <!-- Two-Column Grid -->
  {#if groups.length > 0 || generalRecommendations.length > 0}
    <div class="text-xs leading-normal text-gray-700">
      <!-- Left Column: Improvement Groups -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-3 auto-rows-fr print:grid-cols-2">
        {#each groups as group (group.key)}
          <div class="min-h-[60px]">
            <h4 class="mb-2 font-bold text-gray-900">{group.label}</h4>
            {#if group.suggestions.length > 0}
              <div class="">
                {#each group.suggestions as suggestion}
                  <div class="flex items-start">
                    <span class="mr-2 text-gray-400">•</span>
                    <span>{suggestion}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Column Divider -->
      <!-- <div class="column-divider"></div> -->

      <!-- Right Column: General Recommendations -->
      <div class="col-span-2 print:w-full">
        {#if generalRecommendations.length > 0}
          <div class="my-4 print:w-full">
            <h4 class="my-4 text-2xl font-bold text-gray-900">General Recommendations</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 print:w-full">
              <!-- Left Column of Recommendations -->
              <div>
                {#each generalRecommendations.slice(0, Math.ceil(generalRecommendations.length / 2)) as recommendation}
                  <div class="flex items-start mb-1 text-xs">
                    <span class="mr-2 text-gray-400">•</span>
                    <span>{recommendation}</span>
                  </div>
                {/each}
              </div>
              <!-- Right Column of Recommendations -->
              <div>
                {#each generalRecommendations.slice(Math.ceil(generalRecommendations.length / 2)) as recommendation}
                  <div class="flex items-start mb-1 text-xs">
                    <span class="mr-2 text-gray-400 text-xs">•</span>
                    <span>{recommendation}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <p class="text-center text-gray-600 italic">
      No improvements required. Great work! This posting is performing well across our primary visibility signals.
    </p>
  {/if}
</div>
