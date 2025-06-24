import { writable } from 'svelte/store';

// Initial state for the audit store
const initialState = {
  isLoading: false,
  results: null,
  error: null,
  showResults: false,
  inputType: 'url', // 'url' or 'text'
  jobUrl: '',
  jobDescription: ''
};

// Create the writable store
const createAuditStore = () => {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    update,
    
    // Set loading state
    setLoading: (isLoading) => update(state => ({ ...state, isLoading })),
    
    // Set input type (URL or text)
    setInputType: (inputType) => update(state => ({ ...state, inputType })),
    
    // Update job URL
    setJobUrl: (jobUrl) => update(state => ({ ...state, jobUrl })),
    
    // Update job description
    setJobDescription: (jobDescription) => update(state => ({ ...state, jobDescription })),
    
    // Submit audit for processing
    submitAudit: async (type, data) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // This will be replaced with actual API call
        const results = await mockAuditResults(type, data);
        update(state => ({ 
          ...state, 
          results, 
          isLoading: false, 
          showResults: true,
          error: null
        }));
        return results;
      } catch (error) {
        update(state => ({ 
          ...state, 
          isLoading: false,
          error: error.message || 'An error occurred during analysis'
        }));
        throw error;
      }
    },
    
    // Toggle results visibility
    toggleResults: (showResults) => update(state => ({ ...state, showResults })),
    
    // Reset store to initial state
    reset: () => set(initialState)
  };
};

// Mock function to generate sample audit results
// Will be replaced with actual API integration
const mockAuditResults = async (type, data) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate random scores between 60 and 95
  const inclusivityScore = Math.floor(Math.random() * 36) + 60;
  const clarityScore = Math.floor(Math.random() * 36) + 60;
  const effectivenessScore = Math.floor(Math.random() * 36) + 60;
  const overallScore = Math.floor((inclusivityScore + clarityScore + effectivenessScore) / 3);
  
  return {
    timestamp: new Date().toISOString(),
    inputType: type,
    inputData: data.substring(0, 100) + (data.length > 100 ? '...' : ''),
    overallScore,
    inclusivityScore,
    clarityScore,
    effectivenessScore,
    inclusivityNotes: 'Analysis found some gender-coded language that could be made more inclusive.',
    clarityNotes: 'Job requirements could be more clearly defined with specific examples.',
    effectivenessNotes: 'Adding more specific details about company culture would improve candidate attraction.',
    recommendations: [
      'Replace "he/she" with "they" or restructure sentences to avoid gendered pronouns.',
      'Specify required years of experience more clearly.',
      'Add more specific details about day-to-day responsibilities.',
      'Include information about work environment and team culture.',
      'Consider adding salary range for increased transparency.'
    ],
    highlights: [
      {
        text: 'Strong background required',
        suggestion: 'Specify what "strong background" means with clear, measurable criteria.'
      },
      {
        text: 'Looking for a rockstar developer',
        suggestion: 'Replace "rockstar" with more inclusive and specific language about skills needed.'
      },
      {
        text: 'Must be a team player',
        suggestion: 'Describe specifically how collaboration happens in your team.'
      }
    ]
  };
};

// Export a single instance of the store
export const auditStore = createAuditStore();
