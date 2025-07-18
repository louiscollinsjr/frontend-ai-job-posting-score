<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import type { Report, SupabaseReport } from '$lib/types/report';
  
  let error = null;
  let processingReport = false;
  let currentUser = null;
  
  // Subscribe to user store to get current user
  const unsubUser = user.subscribe(val => {
    currentUser = val;
  });
  
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
      console.log('[localStorage-auth] Guest report found?', !!guestReport, guestReport ? `Size: ${guestReport.length} bytes` : '');
      
      if (guestReport) {
        processingReport = true;
        const reportData = JSON.parse(guestReport);
        
        // Format the report to match the database schema
        const formattedReport = formatReportForDB(reportData, userId);
        console.log('Saving formatted guest report to Supabase:', formattedReport);
        
        // Save report to Supabase 'reports' table
        if (typeof window !== 'undefined') {
          // Transform to match Supabase's lowercase column names (SupabaseReport interface)
          const dbReport = {
            // Map camelCase fields to lowercase for Supabase
            userid: formattedReport.userId,
            jobtitle: formattedReport.job_title,
            jobbody: formattedReport.job_body,
            feedback: formattedReport.feedback,
            totalscore: formattedReport.total_score,
            // Ensure JSON fields are properly formatted
            categories: typeof formattedReport.categories === 'string' 
              ? JSON.parse(formattedReport.categories) 
              : formattedReport.categories,
            recommendations: Array.isArray(formattedReport.recommendations) 
              ? formattedReport.recommendations 
              : [],
            redflags: Array.isArray(formattedReport.red_flags) 
              ? formattedReport.red_flags 
              : [],
            savedat: formattedReport.savedAt,
            source: formattedReport.source,
            // Store original as JSON object for the jsonb column
            originalreport: typeof formattedReport.original_report === 'string' 
              ? JSON.parse(formattedReport.original_report) 
              : formattedReport
          };
          
          console.log('Final report object being sent to Supabase:', dbReport);
          
          const { data, error: dbError } = await supabase.from('reports').insert([dbReport]).select();
          if (dbError) {
            console.error('Error saving report to database:', dbError);
            console.error('Supabase error code:', dbError.code);
            console.error('Supabase error message:', dbError.message);
            console.error('Supabase error details:', dbError.details);
          } else {
            console.log('Guest report saved to database for user:', userId, data);
          }
        } else {
          console.log('Not running in browser, skipping DB save.');
        }
        
        // Do NOT clear the guest report here; let the results page remove it after display
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
    // Get the URL hash
    const hash = window.location.hash;
    
    if (hash && hash.includes('access_token')) {
      try {
        // Process the callback URL with Supabase
        const { data, error: authError } = await supabase.auth.setSession({
          access_token: hash.split('access_token=')[1].split('&')[0],
          refresh_token: hash.split('refresh_token=')[1].split('&')[0],
        });
        
        if (authError) {
          error = authError.message;
        } else {
          // If login successful, associate any guest report with the user
          let redirected = false;
          if (data?.user?.id) {
            const guestReportExisted = await associateGuestReport(data.user.id);
            // If a guest report was present, redirect to results page
            if (guestReportExisted) {
              redirected = true;
              goto('/results?from=guest-login');
            }
          }
          // If no guest report, redirect to intended destination
          if (!redirected) {
            // 1. Check for ?redirect= param in URL
            let redirectTo = null;
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('redirect')) {
              redirectTo = urlParams.get('redirect');
            } else {
              // 2. Fallback: check localStorage for intended destination
              redirectTo = localStorage.getItem('intended_destination');
            }
            // 3. Fallback: dashboard
            if (!redirectTo || redirectTo === '/auth/callback') {
              redirectTo = '/dashboard';
            }
            // Clean up localStorage
            localStorage.removeItem('intended_destination');
            goto(redirectTo);
          }
        }
      } catch (err) {
        error = 'Failed to process authentication. Please try again.';
        console.error('Auth callback error:', err);
      }
    } else {
      // If no hash with tokens, redirect to login
      goto('/login');
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
      <p class="mt-4 text-xs text-gray-400">© 2025 JobPostScore. All rights reserved.</p>
    </div>
  </div>
</div>
