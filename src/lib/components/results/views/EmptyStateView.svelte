<script lang="ts">
  import { GuestManager } from '$lib/services/guestManager';
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  
  // Default demo data - same as in original component
  const defaultResults = {
    job_title: "Senior Frontend Developer",
    job_body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    timestamp: "2025-06-24T12:00:00Z",
    total_score: 82,
    categories: {
      clarity: { score: 16, maxScore: 20, suggestions: ["Shorten sentences"] },
      promptAlignment: { score: 18, maxScore: 20, suggestions: ["Group skills more logically"] },
      structuredData: { score: 11, maxScore: 15, suggestions: ["Add schema.org/JobPosting JSON-LD"] },
      recency: { score: 8, maxScore: 10, suggestions: [] },
      keywordTargeting: { score: 13, maxScore: 15, suggestions: ["Add more relevant keywords"] },
      compensation: { score: 8, maxScore: 10, suggestions: ["Include salary range"] },
      pageContext: { score: 8, maxScore: 10, suggestions: [] }
    },
    red_flags: ["structuredData"],
    recommendations: [
      "Add schema.org/JobPosting JSON-LD for better visibility",
      "Include a salary range for transparency",
      "Group skills and requirements more logically",
      "Shorten overly long sentences"
    ],
    feedback: "The job posting is clear in terms of specifying required skills, experience, and education. However, the clarity could be improved by shortening sentences and grouping requirements more logically. Adding structured data and a salary range would further increase visibility and transparency."
  };

  $: showDefaultData = GuestManager.shouldShowDefaultData();
</script>

{#if showDefaultData}
  <!-- Show default data if URL contains ?from=default -->
  <div class="text-center text-blue-600 mb-4 text-sm">
    <em>Demo data shown for preview purposes</em>
  </div>
  <ResultsDisplay results={defaultResults} />
{:else}
  <!-- Show nothing or a friendly message if no data -->
  <div class="text-center text-gray-500 py-16">
    <div class="max-w-md mx-auto">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Report Available</h3>
      <p class="text-gray-500">
        No audit results to display. Please run an audit first.
      </p>
    </div>
  </div>
{/if}
