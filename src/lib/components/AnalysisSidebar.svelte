<script>
  import { JobPostAnalyzer } from '$lib/services/jobAnalyzer.js';
  import ScoreGauge from './ScoreGauge.svelte';
  import RecommendationItem from './RecommendationItem.svelte';
  
  export let text = '';
  export let isCollapsed = false;
  export let realTimeAnalysis = true;
  
  let analysis = null;
  let isAnalyzing = false;
  
  // Reactive analysis with debouncing
  let analysisTimeout;
  $: if (realTimeAnalysis && text) {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
      performAnalysis(text);
    }, 500); // 500ms debounce
  } else if (!text) {
    analysis = null;
    isAnalyzing = false;
  }

  async function performAnalysis(textToAnalyze) {
    if (!textToAnalyze || textToAnalyze.length === 0) return;
    
    isAnalyzing = true;
    try {
      const analyzer = new JobPostAnalyzer();
      analysis = await analyzer.analyzeJobPost(textToAnalyze);
    } catch (error) {
      console.error('Analysis failed:', error);
      analysis = null;
    } finally {
      isAnalyzing = false;
    }
  }
  
  function toggleSidebar() {
    isCollapsed = !isCollapsed;
  }
  
  function formatScoreChange(change) {
    if (change > 0) return `+${change}`;
    return change.toString();
  }
  
  $: allRecommendations = analysis ? [
    ...analysis.readability.feedback.map(f => ({ 
      category: 'Readability', 
      message: f, 
      severity: 'medium', 
      type: 'readability' 
    })),
    ...analysis.inclusivity.recommendations.map(f => ({ 
      category: 'Inclusivity', 
      message: f, 
      severity: 'high', 
      type: 'inclusivity' 
    })),
    ...analysis.seo.feedback.map(f => ({ 
      category: 'SEO', 
      message: f, 
      severity: 'low', 
      type: 'seo' 
    })),
    ...analysis.structure.feedback.map(f => ({ 
      category: 'Structure', 
      message: f, 
      severity: 'medium', 
      type: 'structure' 
    }))
  ].filter(r => !r.message.toLowerCase().includes('good')) : [];
</script>

<div class="analysis-sidebar fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 z-20 {isCollapsed ? 'w-12' : 'w-80'}">
  <!-- Toggle Button -->
  <button 
    class="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-l-lg p-2 shadow-md hover:bg-gray-50 transition-colors"
    on:click={toggleSidebar}
  >
    <svg 
      class="w-4 h-4 transition-transform duration-300 {isCollapsed ? 'rotate-180' : ''}" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  
  {#if !isCollapsed}
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Analysis</h2>
        <p class="text-sm text-gray-600">Real-time feedback on your job post</p>
      </div>
      
      <!-- Content -->
      <div class="flex-1 overflow-auto p-4 space-y-6">
        {#if isAnalyzing}
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        {:else if analysis}
          <!-- Overall Score -->
          <div class="text-center">
            <ScoreGauge 
              score={analysis.overallScore} 
              maxScore={100} 
              size="md" 
              label="Overall Score"
            />
          </div>
          
          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <ScoreGauge 
                score={analysis.readability.score} 
                maxScore={100} 
                size="sm" 
                label="Readability"
              />
            </div>
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <ScoreGauge 
                score={analysis.inclusivity.score} 
                maxScore={100} 
                size="sm" 
                label="Inclusivity"
              />
            </div>
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <ScoreGauge 
                score={analysis.seo.score} 
                maxScore={100} 
                size="sm" 
                label="SEO"
              />
            </div>
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <ScoreGauge 
                score={analysis.structure.score} 
                maxScore={100} 
                size="sm" 
                label="Structure"
              />
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="bg-blue-50 rounded-lg p-3">
            <h3 class="font-medium text-sm text-blue-900 mb-2">Quick Stats</h3>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-blue-600">Words:</span>
                <span class="font-medium">{analysis.wordCount}</span>
              </div>
              <div>
                <span class="text-blue-600">Grade Level:</span>
                <span class="font-medium">{analysis.readability.gradeLevel}</span>
              </div>
              <div>
                <span class="text-blue-600">Keywords:</span>
                <span class="font-medium">{analysis.seo.keywords.length}</span>
              </div>
              <div>
                <span class="text-blue-600">Issues:</span>
                <span class="font-medium">{analysis.inclusivity.issuesFound.length}</span>
              </div>
            </div>
          </div>
          
          <!-- Recommendations -->
          {#if allRecommendations.length > 0}
            <div>
              <h3 class="font-medium text-sm text-gray-900 mb-3">Recommendations</h3>
              <div class="space-y-2">
                {#each allRecommendations.slice(0, 8) as rec}
                  <RecommendationItem 
                    category={rec.category}
                    message={rec.message}
                    severity={rec.severity}
                    type={rec.type}
                  />
                {/each}
              </div>
            </div>
          {:else}
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div class="text-green-600 text-2xl mb-2">✅</div>
              <p class="text-sm font-medium text-green-800">Excellent job posting!</p>
              <p class="text-xs text-green-600">No major issues found</p>
            </div>
          {/if}
          
          <!-- SEO Keywords (if available) -->
          {#if analysis.seo.keywords.length > 0}
            <div>
              <h3 class="font-medium text-sm text-gray-900 mb-2">Found Keywords</h3>
              <div class="flex flex-wrap gap-1">
                {#each analysis.seo.keywords as keyword}
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {keyword}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Missing Keywords -->
          {#if analysis.seo.missingKeywords.length > 0}
            <div>
              <h3 class="font-medium text-sm text-gray-900 mb-2">Consider Adding</h3>
              <div class="flex flex-wrap gap-1">
                {#each analysis.seo.missingKeywords.slice(0, 5) as keyword}
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {keyword}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
        {:else}
          <div class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-3">📝</div>
            <p class="text-sm">Start editing to see analysis</p>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Collapsed state -->
    <div class="h-full flex flex-col items-center justify-center py-8">
      <div class="transform rotate-90 text-xs font-medium text-gray-600 whitespace-nowrap">
        Analysis
      </div>
      {#if analysis}
        <div class="mt-4">
          <ScoreGauge 
            score={analysis.overallScore} 
            maxScore={100} 
            size="sm" 
            showLabel={false}
          />
        </div>
      {/if}
    </div>
  {/if}
</div>
