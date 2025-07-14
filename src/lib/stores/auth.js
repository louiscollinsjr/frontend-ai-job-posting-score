import { writable } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://zincimrcpvxtugvhimny.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbmNpbXJjcHZ4dHVndmhpbW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzYzMjEsImV4cCI6MjA2NjE1MjMyMX0.BSD0INCOi4XCCRjdlxIdXDxCDv12pI8J082slxB9q4A';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
