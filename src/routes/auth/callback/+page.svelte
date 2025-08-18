<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import type { Report, SupabaseReport } from '$lib/types/report';
  
  let error = null;
  let processingReport = false;
  let currentUser = null;
  
  // Subscribe to user store on mount (client-only)
  // and clean up on unmount to prevent leaks across navigations/requests
  // (avoids SSR-time side effects)
  
  // Format report data to match the database schema
  function formatReportForDB(report: any, userId: string): any {
    // Ensure all required fields are present
    return {
      userId: userId,
      job_title: report.job_title || 'Untitled Job',
      job_body: report.job_body || report.content || '',
      feedback: report.feedback || '',
      total_score: report.total_score || 0,
      categories: report.categories || {},
      recommendations: report.recommendations || [],
      red_flags: report.red_flags || [],
      savedAt: new Date().toISOString(),
      source: report.source || 'guest_conversion',
      // Store the original report JSON for future use
      original_report: JSON.stringify(report)
    };
  }

  // Function to associate guest report with user account
  async function associateGuestReport(userId) {
    try {
      // Check if there's a guest report in localStorage
      console.log('[localStorage-auth] Checking for guest_audit_report in associateGuestReport');
      const guestReport = localStorage.getItem('guest_audit_report');
      const guestReportTsStr = localStorage.getItem('guest_audit_report_ts');
      const now = Date.now();
      const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes freshness window
      let isFresh = true;
      if (guestReportTsStr) {
        const ts = parseInt(guestReportTsStr, 10);
        if (!Number.isNaN(ts)) {
          isFresh = now - ts <= MAX_AGE_MS;
        }
      }
      console.log('[localStorage-auth] Guest report found?', !!guestReport, guestReport ? `Size: ${guestReport.length} bytes` : '');
      if (guestReport && !isFresh) {
        console.log('[localStorage-auth] Guest report is stale; clearing and skipping redirect');
        localStorage.removeItem('guest_audit_report');
        localStorage.removeItem('guest_audit_report_ts');
        return false;
      }
      
      if (guestReport) {
        processingReport = true;
        const reportData = JSON.parse(guestReport);
        
        // Format the report to match the database schema
        const formattedReport = formatReportForDB(reportData, userId);
        console.log('Saving formatted guest report to Supabase (snake_case columns):', formattedReport);
        
        // Save report to Supabase 'reports' table
        if (typeof window !== 'undefined') {
          // Use snake_case column names to match the current Supabase schema
          const dbReport = {
            userid: formattedReport.userId,
            job_title: formattedReport.job_title,
            job_body: formattedReport.job_body,
            feedback: formattedReport.feedback,
            total_score: formattedReport.total_score,
            // Ensure JSON fields are properly formatted
            categories: (() => {
              try {
                return typeof formattedReport.categories === 'string'
                  ? JSON.parse(formattedReport.categories)
                  : formattedReport.categories || {};
              } catch {
                console.warn('Failed to parse categories, using empty object');
                return {};
              }
            })(),
            recommendations: Array.isArray(formattedReport.recommendations)
              ? formattedReport.recommendations
              : [],
            red_flags: Array.isArray(formattedReport.red_flags)
              ? formattedReport.red_flags
              : [],
            savedat: formattedReport.savedAt,
            source: formattedReport.source,
            // Store original as JSON object for the jsonb column
            original_report: (() => {
              try {
                const src = formattedReport.original_report ?? formattedReport;
                if (typeof src === 'string') {
                  return JSON.parse(src);
                }
                return src || {};
              } catch {
                console.warn('Failed to parse original_report, storing empty object');
                return {};
              }
            })()
          };
          
          console.log('Final report object being sent to Supabase:', dbReport);

          const { data, error: dbError } = await supabase
            .from('reports')
            .insert([dbReport])
            .select('id')
            ;
          if (dbError) {
            console.error('Error saving report to database:', dbError);
            console.error('Supabase error code:', dbError.code);
            console.error('Supabase error message:', dbError.message);
            console.error('Supabase error details:', dbError.details);
          } else {
            console.log('Guest report saved to database for user:', userId, data);
            // Return the newly created report ID so the caller can redirect directly
            const insertedId = Array.isArray(data) && data.length > 0 ? data[0]?.id : null;
            if (insertedId) {
              return insertedId;
            }
          }
        } else {
          console.log('Not running in browser, skipping DB save.');
        }
        
        // Do NOT clear the guest report here; let the results page remove it after display
        // Return true to indicate we had a guest report even if insert failed
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error associating guest report:', err);
      return false;
    } finally {
      processingReport = false;
    }
  }
  
  onMount(async () => {
    const unsubUser = user.subscribe((val) => {
      currentUser = val;
    });
    try {
      const href = window.location.href;
      const hash = window.location.hash || '';
      let sessionEstablished = false;
      let userId: string | null = null;

      // 1) Try implicit flow (tokens in hash fragment)
      if (hash.includes('access_token') && hash.includes('refresh_token')) {
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        if (access_token && refresh_token) {
          const { data, error: authError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          if (authError) throw authError;
          userId = data?.session?.user?.id ?? null;
          sessionEstablished = true;
        }
      }

      // 2) Fallback to PKCE/code flow (code/state in query string)
      if (!sessionEstablished) {
        const { data, error: pkceError } = await supabase.auth.exchangeCodeForSession(href);
        if (pkceError) throw pkceError;
        userId = data?.session?.user?.id ?? null;
        sessionEstablished = true;
      }

      if (!sessionEstablished) {
        throw new Error('Could not establish session from URL.');
      }

      // Remove hash fragment (access_token/refresh_token) from URL for security
      try {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      } catch {}

      // Ensure we have a user id
      if (!userId) {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) throw userErr ?? new Error('No user in session');
        userId = userData.user.id;
      }

      // After successful auth, check for guest report
      const hasGuestReport = await associateGuestReport(userId);

      // Redirect based on whether we had a guest report
      if (hasGuestReport) {
        if (typeof hasGuestReport === 'string' && hasGuestReport.length > 0) {
          await goto(`/results?report=${hasGuestReport}`);
        } else {
          await goto('/results?from=guest-login');
        }
      } else {
        await goto('/dashboard');
      }
    } catch (err) {
      error = 'Failed to process authentication. Please try again.';
      console.error('Auth callback error:', err);
    }
    
    return () => {
      unsubUser(); // Clean up subscription
    };
  });
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-md">
    <!-- Logo at the top -->
    <div class="text-center mb-10">
      <a href="/" class="inline-block">
        <span class="text-3xl font-bold text-gray-900">Reach<b>Score</b> <sup class=" hidden text-xs align-super">™</sup></span>
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
      <p class="mt-4 text-xs text-gray-400"> 2025 JobPostScore. All rights reserved.</p>
    </div>
  </div>
</div>
