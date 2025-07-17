import { writable } from 'svelte/store';

// Initialize the store
const CACHE_KEY = 'cached_reports';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function createReportsStore() {
  const { subscribe, set, update } = writable({
    reports: [],
    loading: false,
    error: null,
    lastFetched: null
  });

  return {
    subscribe,
    setReports: (reports) => {
      update(state => ({
        ...state,
        reports,
        lastFetched: Date.now()
      }));
      
      // Save to localStorage with timestamp
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          reports,
          timestamp: Date.now()
        }));
      }
    },
    setLoading: (loading) => {
      update(state => ({ ...state, loading }));
    },
    setError: (error) => {
      update(state => ({ ...state, error }));
    },
    getCachedReports: () => {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { reports, timestamp } = JSON.parse(cached);
            // Check if cache is still valid (within TTL)
            if (Date.now() - timestamp < CACHE_TTL) {
              return reports;
            }
          } catch (e) {
            console.error('Error parsing cached reports', e);
          }
        }
      }
      return null;
    }
  };
}

export const reportsStore = createReportsStore();
