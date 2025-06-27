<script>
  import ResultsDisplay from '$lib/components/ResultsDisplay.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';
  import { auditStore } from '$lib/stores/audit.js';

  // Variable to store audit results
let auditResults;

// Subscribe to audit store
const unsubscribe = auditStore.subscribe(state => {
  auditResults = state.results;
});

onMount(() => {
  console.log('Results page mounted');
  return unsubscribe; // Clean up subscription when component is destroyed
});

  // Dummy data following new API response format
  const results = {
    jobTitle: "Senior Frontend Developer",
    jobBody: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    timestamp: "2025-06-24T12:00:00Z",
    totalScore: 82,
    categories: {
      clarity: { score: 16, maxScore: 20, suggestions: ["Shorten sentences"] },
      promptAlignment: { score: 18, maxScore: 20, suggestions: ["Group skills more logically"] },
      structuredData: { score: 11, maxScore: 15, suggestions: ["Add schema.org/JobPosting JSON-LD"] },
      recency: { score: 8, maxScore: 10, suggestions: [] },
      keywordTargeting: { score: 13, maxScore: 15, suggestions: ["Add more relevant keywords"] },
      compensation: { score: 8, maxScore: 10, suggestions: ["Include salary range"] },
      pageContext: { score: 8, maxScore: 10, suggestions: [] }
    },
    redFlags: ["structuredData"],
    recommendations: [
      "Add schema.org/JobPosting JSON-LD for better visibility",
      "Include a salary range for transparency",
      "Group skills and requirements more logically",
      "Shorten overly long sentences"
    ],
    feedback: "The job posting is clear in terms of specifying required skills, experience, and education. However, the clarity could be improved by shortening sentences and grouping requirements more logically. Adding structured data and a salary range would further increase visibility and transparency."
  };
</script>

<div class="results-page-container">
  <Navbar justLogo={true} />
  
  <div class="pt-16"> <!-- Add padding to account for the fixed navbar -->
    {#if auditResults}
      <!-- Use actual results from audit store if available -->
      <ResultsDisplay results={auditResults} visible={true} />
    {:else}
      <!-- Use dummy data as fallback if no results in store -->
      <ResultsDisplay results={results} visible={true} />
    {/if}
  </div>
</div>

<style>
  .results-page-container {
    width: 100%;
    min-height: 100vh;
    background-color: #ffffff;
  }
</style>
