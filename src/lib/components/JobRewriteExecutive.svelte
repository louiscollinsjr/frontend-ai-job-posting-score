<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getScoreColorHex100 } from '$lib/utils/colors';
  
  // @ts-ignore - passed for future use
  export const original_text = '';
  // @ts-ignore - passed for future use
  export const improvedText = '';
  export let score = 0;
  // @ts-ignore - passed for future use
  export const jobId = '';
  
  // Mock improved score (in real implementation, this would come from API)
  $: originalScore = Math.round(score);
  $: improvedScore = Math.min(originalScore + 15, 100); // Mock improvement
  $: scoreIncrease = improvedScore - originalScore;
  
  // Executive-friendly improvements data
  const improvements = [
    {
      category: 'Job Title Clarity',
      impact: 'High',
      currentExample: 'Corporate Marketing Manager',
      improvedExample: 'Senior Corporate Marketing Manager - San Jose, CA (Hybrid)',
      currentIssue: 'Generic title lacks location and work model',
      improvedBenefit: 'Clear seniority, location, and remote policy',
      scoreGain: '+8 points',
      canFix: true
    },
    {
      category: 'Compensation Transparency',
      impact: 'High', 
      currentExample: 'Competitive salary and benefits package',
      improvedExample: '$95,000 - $125,000 + equity + comprehensive benefits',
      currentIssue: 'No specific compensation details',
      improvedBenefit: 'Clear salary range builds trust and attracts qualified candidates',
      scoreGain: '+12 points',
      canFix: true
    },
    {
      category: 'Required Skills',
      impact: 'Medium',
      currentExample: 'Experience with marketing and communications',
      improvedExample: '5+ years B2B marketing, Google Ads certification, HubSpot expertise',
      currentIssue: 'Vague requirements make screening difficult',
      improvedBenefit: 'Specific qualifications improve candidate fit',
      scoreGain: '+6 points',
      canFix: true
    }
  ];
  
  const strengths = [
    'Company culture clearly described',
    'Growth opportunities highlighted',
    'Benefits package well-detailed',
    'Location and remote work policy specified'
  ];
  
  function handleFixIssue(category: string) {
    // In real implementation, this would apply the specific fix
    console.log(`Applying fix for: ${category}`);
  }
  
  function handleApplyAllFixes() {
    // Apply all available fixes
    console.log('Applying all fixes');
  }
  
  function handlePreviewChanges() {
    // Show detailed preview
    console.log('Showing detailed preview');
  }
</script>

<div class="executive-rewrite-container bg-gray-50 min-h-screen">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200 px-8 py-6">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Job Posting Optimization</h1>
        <p class="text-gray-600 mt-1">AI-powered improvements to boost your posting performance</p>
      </div>
      
      <!-- Score Improvement Preview -->
      <div class="flex items-center gap-6">
        <div class="text-center">
          <div class="text-sm text-gray-500 mb-1">Current Score</div>
          <div class="text-3xl font-bold" style="color: {getScoreColorHex100(originalScore, 100)}">{originalScore}</div>
        </div>
        
        <div class="text-2xl text-gray-400">→</div>
        
        <div class="text-center">
          <div class="text-sm text-gray-500 mb-1">Optimized Score</div>
          <div class="text-3xl font-bold" style="color: {getScoreColorHex100(improvedScore, 100)}">{improvedScore}</div>
        </div>
        
        <div class="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <div class="text-green-800 font-semibold">+{scoreIncrease} Points</div>
          <div class="text-green-600 text-sm">Improvement</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="max-w-6xl mx-auto px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: What's Working Well -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <h2 class="text-lg font-semibold text-gray-900">What's Working Well</h2>
        </div>
        
        <div class="space-y-3">
          {#each strengths as strength}
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700 text-sm">{strength}</span>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Right Column: Areas for Improvement -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 class="text-lg font-semibold text-gray-900">Recommended Improvements</h2>
          </div>
          
          <Button onclick={handleApplyAllFixes} class="bg-blue-600 hover:bg-blue-700">
            Apply All Fixes (+{scoreIncrease} pts)
          </Button>
        </div>
        
        <div class="space-y-4">
          {#each improvements as improvement}
            <div class="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <h3 class="font-semibold text-gray-900">{improvement.category}</h3>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      {improvement.impact === 'High' ? 'bg-red-100 text-red-800' : 
                       improvement.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                       'bg-green-100 text-green-800'}">
                      {improvement.impact} Impact
                    </span>
                    <span class="text-sm text-green-600 font-medium">{improvement.scoreGain}</span>
                  </div>
                  
                  <!-- Before/After Examples -->
                  <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-2">
                          <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                          <div class="text-xs text-gray-600 uppercase tracking-wide font-semibold">Before</div>
                        </div>
                        <div class="text-sm bg-white border border-gray-200 rounded p-3 font-mono text-gray-800">
                          "{improvement.currentExample}"
                        </div>
                        <div class="text-xs text-gray-500 mt-2">{improvement.currentIssue}</div>
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-2">
                          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div class="text-xs text-gray-600 uppercase tracking-wide font-semibold">After</div>
                        </div>
                        <div class="text-sm bg-green-50 border border-green-200 rounded p-3 font-mono text-gray-800">
                          "{improvement.improvedExample}"
                        </div>
                        <div class="text-xs text-green-600 mt-2">{improvement.improvedBenefit}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="ml-4 flex-shrink-0">
                  {#if improvement.canFix}
                    <Button 
                      onclick={() => handleFixIssue(improvement.category)}
                      variant="outline" 
                      size="sm"
                      class="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Fix This
                    </Button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button onclick={handlePreviewChanges} variant="outline" class="flex-1">
            Preview All Changes
          </Button>
          <Button onclick={handleApplyAllFixes} class="flex-1 bg-green-600 hover:bg-green-700">
            Save Optimized Version
          </Button>
        </div>
      </div>
      
    </div>
    
    <!-- Impact Summary -->
    <div class="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Expected Impact</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">+35%</div>
          <div class="text-sm text-gray-600">More Qualified Applicants</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">+{scoreIncrease}</div>
          <div class="text-sm text-gray-600">Point Score Increase</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">-25%</div>
          <div class="text-sm text-gray-600">Time to Fill Position</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .executive-rewrite-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }
</style>
