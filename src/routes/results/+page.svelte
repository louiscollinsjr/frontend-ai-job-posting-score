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

  // Dummy data following API response format
  const results = {
    jobTitle: "Senior Frontend Developer",
    jobBody: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    timestamp: "2025-06-24T12:00:00Z",
    scores: {
      clarity: 3,
      inclusivity: 3,
      fairness: 4
    },
    overallScore: 3.33,
    feedback: "The job posting is clear in terms of specifying required skills, experience, and education. However, the requirement of a PhD may unnecessarily exclude qualified candidates who have equivalent experience and skillsets but do not hold such a degree, negatively impacting inclusivity. Additionally, expecting candidates to work 80 hours per week is not reasonable or fair, as it could negatively affect work-life balance and may disproportionately exclude individuals with family or personal responsibilities, potentially creating bias and limiting diversity in your applicant pool. Consider revising the posting to allow for equivalent experience rather than strictly requiring a PhD, and reduce or clarify expectations around work hours to promote fairness and inclusivity.",
    recommendations: [
      "Use gender-neutral pronouns consistently",
      "Replace terms like 'rockstar' with more inclusive alternatives like 'experienced' or 'skilled'",
      "Consider adding a salary range for transparency",
      "Be more specific about the years of experience required"
    ]
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
