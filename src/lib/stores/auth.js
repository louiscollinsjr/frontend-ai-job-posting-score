 import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabaseClient';
import { GuestReportsAPI } from '$lib/api/reports';
import { formatReportForDB } from '$lib/utils/reportMapper';

/** @typedef {import('@supabase/supabase-js').User} SupabaseUser */

// Using shared Supabase client from $lib/supabaseClient

// Create a store for the user
function createUserStore() {
  /** @type {import('svelte/store').Writable<SupabaseUser | null>} */
  const store = writable(/** @type {SupabaseUser | null} */ (null));
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update,
    // Check if user is logged in on initialization
    init: async () => {
      if (!browser) return;
      
      // Get session from local storage
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        set(user);
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          set(session.user);
        } else if (event === 'SIGNED_OUT') {
          set(null);
        }
      });
    },
    // Sign out the user
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        set(null);
      }
      return { error };
    },
    // Migrate guest reports to authenticated user account
    /**
     * @param {string | null | undefined} userId
     */
    migrateGuestReports: async (userId) => {
      if (!browser || !userId) return { success: false, reportId: null };
      
      try {
        console.log('[Auth Store] Checking for guest reports to migrate');
        const guestReport = GuestReportsAPI.load();
        
        if (!guestReport) {
          console.log('[Auth Store] No guest reports to migrate');
          return { success: false, reportId: null };
        }
        
        console.log('[Auth Store] Migrating guest report to user:', userId);
        const formattedReport = formatReportForDB(guestReport, userId);
        
        const { data, error } = await supabase
          .from('reports')
          .insert([formattedReport])
          .select('id');
        
        if (error) {
          console.error('[Auth Store] Failed to migrate guest report:', error);
          return { success: false, reportId: null, error };
        }
        
        const reportId = data?.[0]?.id || null;
        console.log('[Auth Store] Successfully migrated guest report:', reportId);
        
        // Clear guest cache after successful migration
        GuestReportsAPI.clearAll();
        
        return { success: true, reportId };
      } catch (err) {
        console.error('[Auth Store] Error during guest report migration:', err);
        return { success: false, reportId: null, error: err };
      }
    }
  };
}

export const user = createUserStore();
