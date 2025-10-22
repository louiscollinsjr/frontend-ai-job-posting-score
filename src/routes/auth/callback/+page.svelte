<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import type { Report, SupabaseReport } from '$lib/types/report';
  import { formatReportForDB } from '$lib/utils/reportMapper';
  import { GuestReportsAPI } from '$lib/api/reports';
  
  let error: string | null = null;
  let processingReport = false;
  let currentUser = null;
  
  // Subscribe to user store on mount (client-only)
  // and clean up on unmount to prevent leaks across navigations/requests
  // (avoids SSR-time side effects)
  
  // Format logic is centralized in $lib/utils/reportMapper

  // Function to associate guest report with user account
  async function associateGuestReport(userId: string): Promise<boolean | string> {
    try {
      // Check if there's a guest report using GuestReportsAPI
      console.log('[Auth Callback] Checking for guest reports in localStorage');
      
      const guestReport = GuestReportsAPI.load();
      
      if (!guestReport) {
        console.log('[Auth Callback] No guest report found');
        return false;
      }
      
      console.log('[Auth Callback] Found guest report, migrating to authenticated account');
      processingReport = true;
      
      // Format the report to match the database schema
      const formattedReport = formatReportForDB(guestReport, userId);
      console.log('[Auth Callback] Saving formatted guest report to Supabase:', formattedReport);
      
      // Save report to Supabase 'reports' table
      if (typeof window !== 'undefined') {
        const { data, error: dbError } = await supabase
          .from('reports')
          .insert([formattedReport])
          .select('id');
          
        if (dbError) {
          console.error('[Auth Callback] Error saving report to database:', dbError);
          console.error('[Auth Callback] Supabase error code:', dbError.code);
          console.error('[Auth Callback] Supabase error message:', dbError.message);
          console.error('[Auth Callback] Supabase error details:', dbError.details);
          return false;
        } else {
          console.log('[Auth Callback] Guest report saved to database for user:', userId, data);
          
          // Clear guest cache after successful migration
          GuestReportsAPI.clearAll();
          console.log('[Auth Callback] Cleared guest cache after successful migration');
          
          // Return the newly created report ID for redirect
          const insertedId = Array.isArray(data) && data.length > 0 ? data[0]?.id : null;
          if (insertedId) {
            return insertedId;
          }
          return true;
        }
      } else {
        console.log('[Auth Callback] Not running in browser, skipping DB save.');
        return false;
      }
    } catch (err: unknown) {
      console.error('[Auth Callback] Error associating guest report:', err);
      return false;
    } finally {
      processingReport = false;
    }
  }
  
  onMount(() => {
    console.log('[Auth Callback] Component mounted, starting auth flow');
    
    const unsubUser = user.subscribe((val) => {
      currentUser = val;
      console.log('[Auth Callback] User store updated:', val ? `User ID: ${val.id}` : 'No user');
    });
    
    async function handleAuth() {
      try {
        console.log('[Auth Callback] handleAuth() started');
        const href = window.location.href;
        const hash = window.location.hash || '';
        console.log('[Auth Callback] Current URL:', href);
        console.log('[Auth Callback] Hash fragment:', hash ? 'Present' : 'None');
        
        let sessionEstablished = false;
        let userId: string | null = null;

        // 1) Try implicit flow (tokens in hash fragment)
        console.log('[Auth Callback] Checking for implicit flow tokens in hash');
        if (hash.includes('access_token') && hash.includes('refresh_token')) {
          console.log('[Auth Callback] Implicit flow tokens detected');
          const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');
          if (access_token && refresh_token) {
            console.log('[Auth Callback] Setting session via implicit flow');
            const { data, error: authError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            if (authError) throw authError;
            userId = data?.session?.user?.id ?? null;
            sessionEstablished = true;
            console.log('[Auth Callback] Implicit flow session established, userId:', userId);
          }
        } else {
          console.log('[Auth Callback] No implicit flow tokens found');
        }

        // 2) Fallback to PKCE/code flow (code/state in query string)
        if (!sessionEstablished) {
          console.log('[Auth Callback] Attempting PKCE/code flow');
          const { data, error: pkceError } = await supabase.auth.exchangeCodeForSession(href);
          if (pkceError) throw pkceError;
          userId = data?.session?.user?.id ?? null;
          sessionEstablished = true;
          console.log('[Auth Callback] PKCE flow session established, userId:', userId);
        }

        if (!sessionEstablished) {
          console.error('[Auth Callback] Failed to establish session');
          throw new Error('Could not establish session from URL.');
        }

        console.log('[Auth Callback] Session established successfully');

        // Remove hash fragment (access_token/refresh_token) from URL for security
        try {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          console.log('[Auth Callback] Cleaned URL hash fragment');
        } catch (e) {
          console.warn('[Auth Callback] Failed to clean URL hash:', e);
        }

        // Ensure we have a user id
        if (!userId) {
          console.log('[Auth Callback] No userId from session, fetching user data');
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (userErr || !userData?.user) throw userErr ?? new Error('No user in session');
          userId = userData.user.id;
          console.log('[Auth Callback] Retrieved userId from getUser():', userId);
        }

        // After successful auth, check for guest report
        console.log('[Auth Callback] Starting guest report migration check for userId:', userId);
        const hasGuestReport = await associateGuestReport(userId);
        console.log('[Auth Callback] Guest report migration result:', hasGuestReport);

        // Redirect based on whether we had a guest report
        if (hasGuestReport) {
          if (typeof hasGuestReport === 'string' && hasGuestReport.length > 0) {
            console.log('[Auth Callback] Redirecting to results with migrated report ID:', hasGuestReport);
            await goto(`/results?report=${hasGuestReport}`);
          } else {
            console.log('[Auth Callback] Redirecting to results with guest-login flag');
            await goto('/results?from=guest-login');
          }
        } else {
          console.log('[Auth Callback] No guest report found, redirecting to dashboard');
          await goto('/dashboard');
        }
      } catch (err: unknown) {
        error = 'Failed to process authentication. Please try again.';
        console.error('[Auth Callback] Fatal error in handleAuth():', err);
        if (err instanceof Error) {
          console.error('[Auth Callback] Error message:', err.message);
          console.error('[Auth Callback] Error stack:', err.stack);
        }
      }
    }
    
    console.log('[Auth Callback] Invoking handleAuth()');
    handleAuth();
    
    return () => {
      console.log('[Auth Callback] Component unmounting, cleaning up subscriptions');
      unsubUser(); // Clean up subscription
    };
  });
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-md">
    <!-- Logo at the top -->
    <div class="text-center mb-10">
      <a href="/" class="inline-block">
        <span class="text-3xl font-bold text-gray-900">JobPost<b>Score</b> <sup class=" hidden text-xs align-super">™</sup></span>
      </a>
      <p class="mt-2 text-sm text-gray-600">AI-powered job posting audit tool</p>
    </div>
    
    <!-- Auth card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      {#if error}
        <div class="text-red-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="font-semibold text-xl">Authentication Error</p>
          <p class="text-sm mt-2">{error}</p>
        </div>
        <a href="/login" class="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          Return to Login
        </a>
      {:else}
        <div class="flex flex-col items-center py-6">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
          <p class="text-gray-700 font-medium">Signing you in...</p>
          <p class="text-sm text-gray-500 mt-2">You'll be redirected to your dashboard shortly.</p>
        </div>
      {/if}
    </div>
    
    <!-- Footer links -->
    <div class="mt-8 text-center">
      <div class="flex justify-center space-x-4 text-xs text-gray-500">
        <a href="/" class="hover:text-gray-700">Home</a>
        <a href="/pricing" class="hover:text-gray-700">Pricing</a>
        <a href="/" class="hover:text-gray-700">Terms</a>
        <a href="/" class="hover:text-gray-700">Privacy</a>
      </div>
      <p class="mt-4 text-xs text-gray-400">© 2025 JobPostScore. All rights reserved.</p>
    </div>
  </div>
</div>
