import { writable } from 'svelte/store';

/**
 * @typedef {object} ReportsState
 * @property {Array<any>} reports // TODO refine report type
 * @property {boolean} loading
 * @property {Error | string | null} error
 * @property {number | null} lastFetched
 */

// Initialize the store
const CACHE_KEY = 'cached_reports';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function createReportsStore() {
  const { subscribe, set, update } = writable(
    /** @type {ReportsState} */ ({
      reports: [],
      loading: false,
      error: null,
      lastFetched: null
    })
  );

  return {
    subscribe,
    /**
     * @param {ReportsState['reports']} reports
     */
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
    /**
     * @param {boolean} loading
     */
    setLoading: (loading) => {
      update(state => ({ ...state, loading }));
    },
    /**
     * @param {ReportsState['error']} error
     */
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
