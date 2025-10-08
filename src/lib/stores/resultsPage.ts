import { writable, derived } from 'svelte/store';
import type { Report } from '$lib/types/report';
import type { OptimizationData, RawOptimizationData } from '$lib/types/optimization';

export interface RewriteData {
  original_text: string;
  improvedText: string;
  score: number;
  id: string;
  optimizationData?: OptimizationData | RawOptimizationData;
  recommendations?: string[];
}

interface ResultsPageState {
  // Report data
  currentReport: Report | null;
  rewriteData: RewriteData | null;
  
  // Loading states
  isLoadingReport: boolean;
  isOptimizing: boolean;
  pendingReportId: string | null;
  
  // UI states
  showSaveDialog: boolean;
  showSuccessMessage: boolean;

  // View mode
  requestedView: 'original' | 'optimized' | null;
  fromOptimizedSelection: boolean;
  
  // Timeouts
  dialogTimeout: ReturnType<typeof setTimeout> | null;
  successTimeout: ReturnType<typeof setTimeout> | null;
  
  // Guest state
  fromGuestLogin: boolean;
}

const initialState: ResultsPageState = {
  currentReport: null,
  rewriteData: null,
  isLoadingReport: false,
  isOptimizing: false,
  pendingReportId: null,
  showSaveDialog: false,
  showSuccessMessage: false,
  requestedView: null,
  fromOptimizedSelection: false,
  dialogTimeout: null,
  successTimeout: null,
  fromGuestLogin: false,
};

function createResultsPageStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // Report management
    setCurrentReport: (report: Report | null) =>
      update(state => {
        const nextState = { ...state, currentReport: report };
        const currentReportId = report?.id || report?.report_id || null;
        const rewriteId = state.rewriteData?.id || null;
        if (rewriteId && currentReportId && rewriteId !== currentReportId) {
          nextState.rewriteData = null;
          nextState.requestedView = 'original';
        }
        return nextState;
      }),
    
    setRewriteData: (data: RewriteData | null) =>
      update(state => ({ ...state, rewriteData: data })),
    
    // Loading states
    setLoadingReport: (loading: boolean) =>
      update(state => ({ ...state, isLoadingReport: loading })),
    
    setOptimizing: (optimizing: boolean) =>
      update(state => ({ ...state, isOptimizing: optimizing })),
    
    setPendingReportId: (id: string | null) =>
      update(state => ({ ...state, pendingReportId: id })),
    
    // UI states
    showSaveDialog: () => update(state => ({ ...state, showSaveDialog: true })),
    hideSaveDialog: () => update(state => ({ ...state, showSaveDialog: false })),
    
    showSuccessToast: () => {
      update(state => {
        // Clear existing timeout
        if (state.successTimeout) clearTimeout(state.successTimeout);
        
        const timeout = setTimeout(() => {
          update(s => ({ ...s, showSuccessMessage: false, successTimeout: null }));
        }, 3000);
        
        return { 
          ...state, 
          showSuccessMessage: true, 
          successTimeout: timeout 
        };
      });
    },
    
    hideSuccessToast: () => update(state => {
      if (state.successTimeout) clearTimeout(state.successTimeout);
      return { ...state, showSuccessMessage: false, successTimeout: null };
    }),
    
    // Cleanup
    clearTimeouts: () => update(state => {
      if (state.dialogTimeout) clearTimeout(state.dialogTimeout);
      if (state.successTimeout) clearTimeout(state.successTimeout);
      return { ...state, dialogTimeout: null, successTimeout: null };
    }),
    
    setFromGuestLogin: (fromGuest: boolean) =>
      update(state => ({ ...state, fromGuestLogin: fromGuest })),
    
    setRequestedView: (view: 'original' | 'optimized' | null) =>
      update(state => ({ ...state, requestedView: view })),
    
    setFromOptimizedSelection: (value: boolean) =>
      update(state => ({ ...state, fromOptimizedSelection: value })),
    
    reset: () => set(initialState)
  };
}

export const resultsPageStore = createResultsPageStore();
// Derived stores for common patterns
export const isLoading = derived(
  resultsPageStore,
  $store => $store.isLoadingReport || $store.isOptimizing
);

export const hasReport = derived(
  resultsPageStore,
  $store => !!$store.currentReport
);

export const currentView = derived(
  resultsPageStore,
  $store => {
    const view = (() => {
      if ($store.isLoadingReport) return 'loading';
      if (!$store.currentReport) return 'empty';
      
      // Handle view mode based on URL parameter and data availability
      const currentReportId = $store.currentReport?.id || $store.currentReport?.report_id;
      const rewriteId = $store.rewriteData?.id;

      if ($store.requestedView === 'optimized') {
        if (rewriteId && currentReportId && rewriteId === currentReportId) return 'optimization';
        if ($store.currentReport?.hasRewrite && rewriteId === currentReportId) return 'optimization';
      }
      
      // Default to results view (original score)
      return 'results';
    })();
    
    if (import.meta.env.DEV) {
      console.log('[currentView] Derived view:', view, {
        isLoading: $store.isLoadingReport,
        hasReport: !!$store.currentReport,
        requestedView: $store.requestedView,
        hasRewrite: $store.currentReport?.hasRewrite,
        hasRewriteData: !!$store.rewriteData
      });
    }
    
    return view;
  }
);
