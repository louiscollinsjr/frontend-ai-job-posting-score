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
      update(state => ({ ...state, currentReport: report })),
    
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
    if ($store.rewriteData) return 'optimization';
    if ($store.isLoadingReport) return 'loading';
    if ($store.currentReport) return 'results';
    return 'empty';
  }
);
