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

<div class="my-10 print:mt-0 print:pt-8">
  <!-- Header -->
  <div class="mb-4 border-b border-gray-200 pb-3 flex items-baseline gap-2">
    <h3 class="text-2xl font-semibold text-gray-900">Suggested Improvements</h3>
    <!-- <p class="text-sm text-gray-600">Prioritized by opportunity</p> -->
  </div>

  <!-- Two-Column Grid -->
  {#if groups.length > 0 || generalRecommendations.length > 0}
    <div class="text-base leading-normal text-gray-700">
      <!-- Left Column: Improvement Groups -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-1">
        {#each groups as group (group.key)}
          <div class="mb-4 ">
            <h4 class="mb-2 text-base font-bold text-gray-900">{group.label}</h4>
            {#if group.suggestions.length > 0}
              <div class="text-base">
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
      <div class="col-span-2">
        {#if generalRecommendations.length > 0}
          <div class="my-4">
            <h4 class="my-4 text-2xl font-bold text-gray-900">General Recommendations</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-1">
              <!-- Left Column of Recommendations -->
              <div>
                {#each generalRecommendations.slice(0, Math.ceil(generalRecommendations.length / 2)) as recommendation}
                  <div class="flex items-start mb-1 text-base">
                    <span class="mr-2 text-gray-400">•</span>
                    <span>{recommendation}</span>
                  </div>
                {/each}
              </div>
              <!-- Right Column of Recommendations -->
              <div>
                {#each generalRecommendations.slice(Math.ceil(generalRecommendations.length / 2)) as recommendation}
                  <div class="flex items-start mb-1 text-base">
                    <span class="mr-2 text-gray-400 text-base">•</span>
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
