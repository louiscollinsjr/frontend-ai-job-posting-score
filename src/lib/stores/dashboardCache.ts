import { writable, derived, get } from 'svelte/store';
import { env } from '$env/dynamic/public';

const API_BASE_URL = (env.PUBLIC_API_BASE_URL && env.PUBLIC_API_BASE_URL.trim()) || 'https://ai-audit-api.fly.dev';

interface Report {
  id: string;
  [key: string]: any;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalReports: number;
}

interface ReportOptimization {
  lowestScore: number;
  highestScore: number;
  hasOptimizations: boolean;
}

interface CachedPage {
  reports: Report[];
  pagination: PaginationInfo;
  timestamp: number;
  optimizations: Map<string, ReportOptimization>;
}

interface CacheStore {
  pages: Map<number, CachedPage>;
  currentPage: number;
  loading: boolean;
  error: string | null;
  prefetching: Set<number>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 20;

// Create the store
function createDashboardCache() {
  const { subscribe, set, update } = writable<CacheStore>({
    pages: new Map(),
    currentPage: 1,
    loading: false,
    error: null,
    prefetching: new Set()
  });

  const fetchPageData = async (pageNum: number, accessToken: string): Promise<CachedPage> => {
    const apiUrl = `${API_BASE_URL}/api/v1/reports?page=${pageNum}&limit=${PAGE_SIZE}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    let reports: Report[] = [];
    let pagination: PaginationInfo = {
      currentPage: pageNum,
      totalPages: 1,
      totalReports: 0
    };

    if (Array.isArray(data)) {
      reports = data;
      pagination.totalReports = data.length;
    } else if (data.reports) {
      reports = data.reports;
      pagination = data.pagination || pagination;
    }

    const optimizationsMap = new Map<string, ReportOptimization>();
    const optimizations = !Array.isArray(data) ? data.optimizations : undefined;
    if (optimizations && typeof optimizations === 'object') {
      Object.entries(optimizations).forEach(([reportId, value]) => {
        if (!value || typeof value !== 'object') return;
        const lowestScore = Number((value as Record<string, unknown>).lowestScore);
        const highestScore = Number((value as Record<string, unknown>).highestScore);
        const hasOptimizations = Boolean((value as Record<string, unknown>).hasOptimizations);
        optimizationsMap.set(reportId, {
          lowestScore: Number.isFinite(lowestScore) ? lowestScore : 0,
          highestScore: Number.isFinite(highestScore) ? highestScore : 0,
          hasOptimizations
        });
      });
    }

    return {
      reports,
      pagination,
      timestamp: Date.now(),
      optimizations: optimizationsMap
    };
  };

  return {
    subscribe,
    /**
     * Load a specific page (from cache or API)
     */
    async loadPage(pageNum: number, accessToken: string, force = false) {
      const state = get({ subscribe });
      
      // Check cache first
      const cached = state.pages.get(pageNum);
      if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache] Using cached data for page ${pageNum}`);
        update(s => ({ ...s, currentPage: pageNum, loading: false, error: null }));
        return cached;
      }
      
      // Not in cache or expired - fetch from API
      console.log(`[Cache] Fetching page ${pageNum} from API`);
      update(s => ({ ...s, loading: true, error: null }));
      
      try {
        const cachedPage = await fetchPageData(pageNum, accessToken);
        update(s => {
          const newPages = new Map(s.pages);
          newPages.set(pageNum, cachedPage);
          return {
            ...s,
            pages: newPages,
            currentPage: pageNum,
            loading: false,
            error: null
          };
        });
        
        // Prefetch adjacent pages in background
        this.prefetchAdjacentPages(pageNum, accessToken, cachedPage.pagination.totalPages);
        
        return cachedPage;
      } catch (error) {
        console.error('[Cache] Failed to fetch page:', error);
        update(s => ({
          ...s,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load reports'
        }));
        throw error;
      }
    },
    
    /**
     * Prefetch adjacent pages in background
     */
    async prefetchAdjacentPages(currentPage: number, accessToken: string, totalPages: number) {
      const state = get({ subscribe });
      const pagesToPrefetch: number[] = [];
      
      // Prefetch next page
      if (currentPage < totalPages) {
        pagesToPrefetch.push(currentPage + 1);
      }
      
      // Prefetch previous page
      if (currentPage > 1) {
        pagesToPrefetch.push(currentPage - 1);
      }
      
      // Prefetch pages that aren't already cached or being fetched
      for (const pageNum of pagesToPrefetch) {
        const cached = state.pages.get(pageNum);
        const isPrefetching = state.prefetching.has(pageNum);
        
        if (!isPrefetching && (!cached || Date.now() - cached.timestamp >= CACHE_TTL)) {
          console.log(`[Cache] Prefetching page ${pageNum} in background`);
          
          update(s => ({
            ...s,
            prefetching: new Set([...s.prefetching, pageNum])
          }));
          
          // Fetch in background (don't await)
          this.fetchPageInBackground(pageNum, accessToken);
        }
      }
    },
    
    /**
     * Fetch a page in background without updating loading state
     */
    async fetchPageInBackground(pageNum: number, accessToken: string) {
      try {
        const cachedPage = await fetchPageData(pageNum, accessToken);
        update(s => {
          const newPages = new Map(s.pages);
          newPages.set(pageNum, cachedPage);
          const newPrefetching = new Set(s.prefetching);
          newPrefetching.delete(pageNum);
          return {
            ...s,
            pages: newPages,
            prefetching: newPrefetching
          };
        });
        
        console.log(`[Cache] Successfully prefetched page ${pageNum}`);
      } catch (error) {
        console.warn(`[Cache] Failed to prefetch page ${pageNum}:`, error);
        update(s => {
          const newPrefetching = new Set(s.prefetching);
          newPrefetching.delete(pageNum);
          return { ...s, prefetching: newPrefetching };
        });
      }
    },
    
    /**
     * Invalidate a specific page (force refresh on next load)
     */
    invalidatePage(pageNum: number) {
      update(s => {
        const newPages = new Map(s.pages);
        newPages.delete(pageNum);
        return { ...s, pages: newPages };
      });
      console.log(`[Cache] Invalidated page ${pageNum}`);
    },
    
    /**
     * Invalidate all cached pages
     */
    invalidateAll() {
      update(s => ({
        ...s,
        pages: new Map(),
        prefetching: new Set()
      }));
      console.log('[Cache] Invalidated all pages');
    },
    
    /**
     * Get current page data from cache
     */
    getCurrentPageData() {
      const state = get({ subscribe });
      return state.pages.get(state.currentPage);
    }
  };
}

export const dashboardCache = createDashboardCache();

// Derived store for current page data
export const currentPageData = derived(
  dashboardCache,
  $cache => $cache.pages.get($cache.currentPage)
);

// Derived store for loading state
export const isLoading = derived(
  dashboardCache,
  $cache => $cache.loading
);

// Derived store for error state
export const cacheError = derived(
  dashboardCache,
  $cache => $cache.error
);
