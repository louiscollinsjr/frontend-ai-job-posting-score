 import { writable } from 'svelte/store';
 import { browser } from '$app/environment';
 import { supabase } from '$lib/supabaseClient';

 // Using shared Supabase client from $lib/supabaseClient

// Create a store for the user
function createUserStore() {
  const { subscribe, set, update } = writable(null);

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
    }
  };
}

export const user = createUserStore();
