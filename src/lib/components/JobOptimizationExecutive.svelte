<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { marked } from 'marked';
  import Button from '$lib/components/ui/button/button.svelte';
  import WorkingWellPanel from './WorkingWellPanel.svelte';
  import ImprovementCard from './ImprovementCard.svelte';
  import ScoreDisplay from './ScoreDisplay.svelte';
  import ExportButton from './ExportButton.svelte';
  import type { ExportData } from '$lib/utils/exportUtils';
	import OptimizedScoreNotice from './results/OptimizedScoreNotice.svelte';
  // import BetaBadge from '$lib/components/BetaBadge.svelte';
  
  // Types
  export type AppliedImprovement = {
    category: string;
    description: string;
    impactPoints?: number;
    applied?: boolean;
    impact?: string;
    scoreContribution?: string;
  };

  export type PotentialImprovement = {
    category: string;
    description: string;
    potentialPoints?: number;
  };

  export type OptimizationData = {
    originalText: string;
    optimizedText: string;
    originalScore: number;
    optimizedScore: number;
    scoreImprovement: number;
    workingWell: string[];
    appliedImprovements: AppliedImprovement[];
    potentialImprovements: PotentialImprovement[];
  };

  // Shape we might receive directly from DB/API before mapping
  export type RawOptimizationData = {
    change_log?: string | AppliedImprovement[];
    unaddressed_items?: string | PotentialImprovement[];
    workingWell?: string[];
    original_text_snapshot?: string;
    optimized_text?: string;
    original_score?: number;
    optimized_score?: number;
  } & Record<string, unknown>;

  function isOptimizationData(value: unknown): value is OptimizationData {
    const v = value as any;
    return (
      v &&
      typeof v === 'object' &&
      'appliedImprovements' in v &&
      Array.isArray(v.appliedImprovements) &&
      'optimizedText' in v
    );
  }
  
  export let originalText: string = '';
  export let improvedText: string = '';
  export let reportId: string | undefined = undefined;
  export let initialData: OptimizationData | RawOptimizationData | null = null;
  export let recommendations: string[] = [];
  export let score: number = 0;
  
  let optimizationData: OptimizationData | null = null;
  let isLoading: boolean = false;
  let error: string | null = null;
  let isApplyingFixes: boolean = false;
  let totalImprovementPoints: number = 0;
  
  // API base URL (configurable)
  // Fallback to production fly.io URL if PUBLIC_API_BASE_URL is not set
  const apiBaseUrl = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';
  
  // Transform raw database/API data to the expected OptimizationData format
  function transformInitialData(data: OptimizationData | RawOptimizationData | null): OptimizationData | null {
    if (!data) return null;

    // Already in the desired shape
    if (isOptimizationData(data)) return data;

    const raw = data as RawOptimizationData;
    
    console.log('[JobOptimizationExecutive] Raw data:', {
      change_log: raw.change_log,
      change_log_type: typeof raw.change_log,
      unaddressed_items: raw.unaddressed_items,
      unaddressed_items_type: typeof raw.unaddressed_items
    });
    
    // Parse arrays from possible JSON strings
    let changeLogArray = Array.isArray(raw.change_log)
      ? raw.change_log
      : JSON.parse((raw.change_log as string | undefined) || '[]');
    
    let unaddressedArray = Array.isArray(raw.unaddressed_items)
      ? raw.unaddressed_items
      : JSON.parse((raw.unaddressed_items as string | undefined) || '[]');
    
    console.log('[JobOptimizationExecutive] Parsed arrays:', {
      changeLogArray,
      unaddressedArray
    });
    
    // Convert string arrays to proper improvement objects
    const appliedImprovements: AppliedImprovement[] = changeLogArray.map((item: any, index: number) => {
      if (typeof item === 'string') {
        return {
          category: `Improvement ${index + 1}`,
          description: item,
          applied: true
        };
      }
      return item as AppliedImprovement;
    }).filter((item: AppliedImprovement) => item.description && item.description.trim().length > 0);

    const potentialImprovements: PotentialImprovement[] = unaddressedArray.map((item: any, index: number) => {
      if (typeof item === 'string') {
        return {
          category: `Future Enhancement ${index + 1}`,
          description: item
        };
      }
      return item as PotentialImprovement;
    }).filter((item: PotentialImprovement) => item.description && item.description.trim().length > 0);

    const originalScore = typeof raw.original_score === 'number' ? raw.original_score : score || 0;
    const optimizedScore = typeof raw.optimized_score === 'number' ? raw.optimized_score : originalScore + 10;
    const origText = (raw.original_text_snapshot as string | undefined) ?? originalText ?? '';
    const optText = (raw.optimized_text as string | undefined) ?? improvedText ?? '';

    const result = {
      originalText: origText,
      optimizedText: optText,
      originalScore,
      optimizedScore,
      scoreImprovement: optimizedScore - originalScore,
      workingWell: raw.workingWell || [],
      appliedImprovements,
      potentialImprovements
    };
    
    console.log('[JobOptimizationExecutive] Transformed data:', {
      appliedImprovements: result.appliedImprovements.length,
      potentialImprovements: result.potentialImprovements.length,
      sample: result.appliedImprovements[0]
    });
    
    return result;
  }

  // Reactively handle changes to initialData
  $: if (initialData) {
    console.log('[DEBUG] JobOptimizationExecutive reactive update - initialData:', initialData);
    const transformedData = transformInitialData(initialData);
    console.log('[DEBUG] appliedImprovements array:', transformedData?.appliedImprovements);
    optimizationData = transformedData;
  }

  // Initialize with provided data or fetch optimization
  onMount(async () => {
    if (initialData) {
      // Already handled by reactive statement above
      return;
    } else if (improvedText && improvedText.trim()) {
      // We have improved text, create optimization data from it
      optimizationData = {
        originalText: originalText,
        optimizedText: improvedText,
        originalScore: score,
        optimizedScore: score + 10, // Estimate improvement
        scoreImprovement: 10,
        workingWell: [],
        appliedImprovements: createImprovementsFromRecommendations(recommendations),
        potentialImprovements: []
      };
    } else if (originalText && originalText.trim()) {
      await optimizeJobPost();
    } else {
      // Try to load cached optimization data for this report
      await loadCachedOptimization();
    }
  });
  
  // Load cached optimization data from backend if available
  async function loadCachedOptimization(): Promise<void> {
    if (!reportId) return;
    
    try {
      isLoading = true;
      const response = await fetch(`${apiBaseUrl}/api/v1/optimize-job/${reportId}`);
      if (response.ok) {
        const raw = await response.json();
        const transformed = transformInitialData(raw as any);
        optimizationData = transformed;
      }
    } catch (err: unknown) {
      console.log('No cached optimization found, will need to optimize when text is available');
    } finally {
      isLoading = false;
    }
  }
  
  async function optimizeJobPost(): Promise<void> {
    isLoading = true;
    error = null;
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/optimize-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: originalText,
          job_id: reportId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.status}`);
      }
      
      const raw = await response.json();
      optimizationData = transformInitialData(raw as any);
    } catch (err: unknown) {
      console.error('Error optimizing job post:', err);
      error = err instanceof Error ? err.message : String(err);
    } finally {
      isLoading = false;
    }
  }
  
  async function applyAllFixes() {
    isApplyingFixes = true;
    
    try {
      // In a real implementation, this would apply all remaining improvements
      // For now, we'll simulate the action
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh optimization data to show applied fixes
      await optimizeJobPost();
    } catch (err) {
      console.error('Error applying fixes:', err);
    } finally {
      isApplyingFixes = false;
    }
  }
  
  function handleFixItem(improvementId: string) {
    // Handle individual fix application
    console.log('Fixing item:', improvementId);
  }
  
  // Helper function to create improvements from recommendations
  function createImprovementsFromRecommendations(recs: string[]): AppliedImprovement[] {
    if (!recs || !Array.isArray(recs)) return [];
    
    return recs.map((rec: string, index: number): AppliedImprovement => ({
      category: `Improvement ${index + 1}`,
      description: typeof rec === 'string' ? rec : JSON.stringify(rec),
      impactPoints: 5,
      applied: true,
      impact: 'Medium Impact',
      scoreContribution: '+5 points'
    }));
  }
  
  // Function to convert markdown to HTML
  function processMarkdown(text: string): string {
    if (!text) return '';
    return marked(text);
  }

  $: totalImprovementPoints = optimizationData?.appliedImprovements?.reduce((sum: number, imp: AppliedImprovement) => sum + (imp.impactPoints || 0), 0) || 0;

  // Local helper functions for score badge styling
  function clampScore(value: number | null | undefined): number {
    if (value === null || value === undefined || Number.isNaN(value)) return 0;
    return Math.min(Math.max(value, 0), 100);
  }

  function getScoreBadgeClasses(score: number | null): string {
    const val = clampScore(score);
    if (val >= 85) return 'bg-emerald-100 text-emerald-900';
    if (val >= 60) return 'bg-amber-100 text-amber-600';
    if (val >= 45) return 'bg-orange-100 text-orange-700';
    return 'bg-rose-100 text-rose-900';
  }
  
  // Export data computed property
  $: exportData = optimizationData ? {
    optimizedText: optimizationData.optimizedText,
    originalScore: optimizationData.originalScore,
    scoreImprovement: optimizationData.scoreImprovement,
    appliedImprovements: optimizationData.appliedImprovements,
    workingWell: optimizationData.workingWell,
    reportId: reportId
  } as ExportData : {
    optimizedText: '',
    originalScore: 0,
    optimizedScore: 0,
    scoreImprovement: 0,
    reportId: reportId
  } as ExportData;

  // Debug log the export data when it changes
  $: if (exportData?.appliedImprovements) {
    console.log('[DEBUG] Export data appliedImprovements:', exportData.appliedImprovements);
  }

  function handleExportSuccess(event: CustomEvent) {
    console.log(`Successfully exported as ${event.detail.format}`);
  }

  function handleExportError(event: CustomEvent) {
    console.error(`Export failed for ${event.detail.format}:`, event.detail.error);
    // You could show a toast notification here
  }
</script>

<div class="min-h-screen bg-gray-transparent pt-20">
  <!-- Header -->
  <div class="bg-transparent border-b px-6 py-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between">
        <!-- Logo Header Section -->
        <div class="flex items-center space-x-2">
          <img src="/jobpostscore_logo.svg" alt="JobPostScore Logo" class="h-10 w-auto" />
         
            <p class="text-3xl font-bold text-gray-900 pt-1">Optimization</p>
      
        </div>
        
        <!-- {#if optimizationData}
          <ScoreDisplay 
            currentScore={optimizationData.originalScore}
            optimizedScore={optimizationData.optimizedScore}
            improvement={optimizationData.scoreImprovement}
          />
        {/if} -->
      </div>
    </div>
  </div>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-96">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <p class="text-gray-600">Optimizing your job posting...</p>
      </div>
    </div>
  {:else if error}
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-medium">Optimization Error</h3>
        <p class="text-red-600 mt-2">{error}</p>
        <Button class="mt-4" on:click={optimizeJobPost}>Try Again</Button>
      </div>
    </div>
  {:else if optimizationData}
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Left Column: Optimized Job Post -->
        <div class="space-y-6 bg-white">
          <div class="bg-white rounded-lg border-3 border-black shadow-sm h-[calc(80vh-12rem)] flex flex-col">
            <div class="px-6 py-4 flex-shrink-0">
              <h2 class="text-lg font-semibold text-gray-900">Optimized Job Posting</h2>
              <p class="text-sm text-gray-600 mt-1">Enhanced version with improvements applied</p>
              <div class="border-t my-4"></div>
            </div>
            <div class="p-6 pt-0 flex-1 overflow-y-auto">
              <div class="prose prose-sm max-w-none">
                <div class="text-gray-800 leading-relaxed">
                  {@html processMarkdown(optimizationData?.optimizedText || '')}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Column: Improvements & Analysis -->
        <div class="space-y-6">
          <!-- {#if optimizationData}
          <ScoreDisplay 
            currentScore={optimizationData.originalScore}
            optimizedScore={optimizationData.optimizedScore}
            improvement={optimizationData.scoreImprovement}
          />
        {/if} -->
        <OptimizedScoreNotice 
          reportId={reportId ?? null}
          originalScore={optimizationData?.originalScore ?? null}
          optimizedScore={optimizationData?.optimizedScore ?? null}
          badgeClassGetter={getScoreBadgeClasses}
          heading="Executive score comparison"
          description="Compare the original score with the JobPostScore optimized results."
          improvementLabel="Improvement"
          linkHref={null}
          linkLabel={null}
          useGoto={false}
        />
          <!-- What's Working Well (Original) -->
        {#if optimizationData && optimizationData.workingWell?.length > 0}
          <div class="bg-white rounded-lg border shadow-sm">
            <div class="px-6 py-4 border-b">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                What's Working Well
              </h3>
              <p class="text-sm text-gray-600 mt-1">Strong aspects from your original posting</p>
            </div>
            <WorkingWellPanel items={optimizationData?.workingWell || []} />
          </div>
        {/if}
          
          <!-- Recommended Improvements -->
          <div class="bg-white rounded-lg border shadow-sm py-4">
            <div class="px-6 py-4 flex items-center justify-between border-b">
              <div class="">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  Applied Improvements
                </h3>
                <p class="text-sm text-gray-600 mt-1">Changes made to optimize your posting</p>
              </div>
              <ExportButton 
                data={exportData}
                disabled={isLoading || !optimizationData?.optimizedText}
                on:exported={handleExportSuccess}
                on:export-error={handleExportError}
              />
              
            </div>
          
            <div class="p-6 pb-0">
              {#each optimizationData?.appliedImprovements || [] as improvement, index}
                <ImprovementCard 
                  {improvement}
                  on:fix={() => handleFixItem(improvement.category)}
                />
              {/each}
              
              {#if (!optimizationData?.appliedImprovements || optimizationData.appliedImprovements.length === 0)}
                <div class="p-6 text-center text-gray-500">
                  <div class="text-2xl mb-2">✅</div>
                  <p class="font-medium">All improvements applied!</p>
                  <p class="text-sm">Your job posting is fully optimized.</p>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Potential Future Improvements -->
          {#if optimizationData && optimizationData.potentialImprovements?.length > 0}
            <div class="bg-gray-50 rounded-lg border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="font-medium text-gray-700">Future Enhancement Opportunities</h3>
                <p class="text-sm text-gray-600 mt-1">Advanced optimizations for maximum impact</p>
              </div>
              <div class="p-6 space-y-3">
                {#each optimizationData.potentialImprovements as potential}
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-gray-700">{potential.category}</h4>
                      <p class="text-sm text-gray-600 mt-1">{potential.description}</p>
                    </div>
                    <!-- <span class="text-xs text-gray-500 ml-4">+{potential.potentialPoints} pts</span> -->
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <div>
            <!-- Category Breakdown -->
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
