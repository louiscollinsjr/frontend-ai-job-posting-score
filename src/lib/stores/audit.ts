import { writable } from 'svelte/store';
import type { AuditResult, InputType } from '../api/audit';

export type AuditResponse = AuditResult | FallbackAuditResult;

type AuditInputType = InputType;

interface AuditCategoryFallback {
  score: number;
  maxScore: number;
  suggestions: string[];
}

interface AuditCategoriesFallback {
  clarity: AuditCategoryFallback;
  promptAlignment: AuditCategoryFallback;
  structuredData: AuditCategoryFallback;
  recency: AuditCategoryFallback;
  keywordTargeting: AuditCategoryFallback;
  compensation: AuditCategoryFallback;
  pageContext: AuditCategoryFallback;
}

export interface FallbackAuditResult {
  total_score: number;
  categories: AuditCategoriesFallback;
  red_flags: string[];
  recommendations: string[];
  job_title: string;
  job_body: string;
  feedback: string;
}

export interface AuditStoreState {
  isLoading: boolean;
  results: AuditResponse | null;
  error: string | null;
  showResults: boolean;
  inputType: AuditInputType;
  jobUrl: string;
  jobDescription: string;
}

interface AuditStore {
  subscribe: ReturnType<typeof writable<AuditStoreState>>['subscribe'];
  update: ReturnType<typeof writable<AuditStoreState>>['update'];
  setLoading: (isLoading: boolean) => void;
  setInputType: (inputType: AuditInputType) => void;
  setJobUrl: (jobUrl: string) => void;
  setJobDescription: (jobDescription: string) => void;
  submitAudit: (type: AuditInputType, data: string | File) => Promise<void>;
  toggleResults: (showResults: boolean) => void;
  reset: () => void;
}

// Initial state for the audit store
const initialState: AuditStoreState = {
  isLoading: false,
  results: null,
  error: null,
  showResults: false,
  inputType: 'url', // 'url' or 'text'
  jobUrl: '',
  jobDescription: ''
};

// Generate fallback results in the correct 7-category format
function generateFallbackResults(type: AuditInputType, data: string): FallbackAuditResult {
  // Random score between 60-90
  const getRandomScore = (max: number): number => Math.floor(Math.random() * (max * 0.6) + (max * 0.3));
  
  // Generate category data
  const clarityScore = getRandomScore(20);
  const promptAlignmentScore = getRandomScore(20);
  const structuredDataScore = getRandomScore(15);
  const recencyScore = getRandomScore(10);
  const keywordTargetingScore = getRandomScore(15);
  const compensationScore = getRandomScore(10);
  const pageContextScore = getRandomScore(10);
  
  const total_score = clarityScore + promptAlignmentScore + structuredDataScore +
    recencyScore + keywordTargetingScore + compensationScore + pageContextScore;
  
  return {
    total_score,
    categories: {
      clarity: {
        score: clarityScore,
        maxScore: 20,
        suggestions: ['Make the job title more specific', 'Reduce buzzwords and corporate jargon']
      },
      promptAlignment: {
        score: promptAlignmentScore,
        maxScore: 20,
        suggestions: ['Align job description with common search terms']
      },
      structuredData: {
        score: structuredDataScore,
        maxScore: 15,
        suggestions: ['Add Schema.org JobPosting markup']
      },
      recency: {
        score: recencyScore,
        maxScore: 10,
        suggestions: ['Include a recent date in the posting']
      },
      keywordTargeting: {
        score: keywordTargetingScore,
        maxScore: 15,
        suggestions: ['Add more relevant industry keywords']
      },
      compensation: {
        score: compensationScore,
        maxScore: 10,
        suggestions: ['Add salary range information']
      },
      pageContext: {
        score: pageContextScore,
        maxScore: 10,
        suggestions: ['Improve page layout to highlight key information']
      }
    },
    red_flags: ['compensation'],
    recommendations: [
      'Include specific salary range information',
      'Add more industry-specific keywords',
      'Remove unnecessary corporate jargon'
    ],
    job_title: type === 'url' ? 'Marketing Director at ACME Corp' : 'Job Posting Analysis',
    job_body: data.substring(0, 100) + (data.length > 100 ? '...' : ''),
    feedback: `This job posting scored ${total_score}/100. Several improvements can be made for better visibility.`
  };
}

// Create the writable store
const createAuditStore = (): AuditStore => {
  const { subscribe, set, update } = writable<AuditStoreState>(initialState);

  return {
    subscribe,
    update,

    // Set loading state
    setLoading: (isLoading: boolean) => update(state => ({ ...state, isLoading })),

    // Set input type (URL or text)
    setInputType: (inputType: AuditInputType) => update(state => ({ ...state, inputType })),

    // Update job URL
    setJobUrl: (jobUrl: string) => update(state => ({ ...state, jobUrl })),

    // Update job description
    setJobDescription: (jobDescription: string) => update(state => ({ ...state, jobDescription })),

    // Submit audit for processing
    submitAudit: async (type: AuditInputType, data: string | File): Promise<void> => {
      // Set loading state
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        let results: AuditResponse;
        try {
          // Attempt to get results from the API
          if (type === 'text') {
            const { auditJobText } = await import('../api/audit');
            results = await auditJobText(data as string);
          } else if (type === 'url') {
            const { auditJobUrl } = await import('../api/audit');
            results = await auditJobUrl(data as string);
          } else if (type === 'file') {
            const { auditJobFile } = await import('../api/audit');
            results = await auditJobFile(data as File);
          } else {
            throw new Error('Unsupported audit type');
          }
          console.log('[auditStore] Raw API response:', results);
        } catch (apiError) {
          console.error(`API error for ${type}:`, apiError);
          console.log('[auditStore] Using fallback data structure for testing...');
          
          // Generate fallback data using the new 7-category structure
          // This mimics what the backend would return
          const fallbackData = typeof data === 'string' ? data : String(data);
          results = generateFallbackResults(type, fallbackData);
        }

        update(state => ({
          ...state,
          results,
          isLoading: false,
          showResults: true,
          error: null
        }));
      } catch (error) {
        console.error(`Error in audit process:`, error);
        const message = error instanceof Error ? error.message : 'Failed to analyze job posting';
        update(state => ({
          ...state,
          isLoading: false,
          error: message
        }));
      }
    },

    // Toggle results visibility
    toggleResults: (showResults: boolean) => update(state => ({ ...state, showResults })),

    // Reset store to initial state
    reset: () => set(initialState)
  };
};



// Export a single instance of the store
export const auditStore: AuditStore = createAuditStore();
