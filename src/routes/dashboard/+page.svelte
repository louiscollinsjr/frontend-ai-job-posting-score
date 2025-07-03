<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import * as Separator from '$lib/components/ui/separator/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Button from '$lib/components/ui/button/index.js';
  import Navbar from '$lib/components/Navbar.svelte';
  
  let loading = true;
  let userEmail = '';
  let userData = null;
  
  // Reports data
  let reports = [];
  let loadingReports = false;
  let reportError = null;
  
  // Function to fetch user reports
  async function fetchUserReports(userId) {
    loadingReports = true;
    reportError = null;
    
    try {
      // First, check localStorage for any guest reports
      console.log('[dashboard] Checking localStorage for guest_audit_report');
      const guestReport = localStorage.getItem('guest_audit_report');
      console.log('[dashboard] Guest report found?', !!guestReport, guestReport ? `Size: ${guestReport.length} bytes` : '');
      
      if (guestReport) {
        try {
          console.log('[dashboard] Attempting to parse guest report');
          const parsedReport = JSON.parse(guestReport);
          console.log('[dashboard] Successfully parsed guest report:', parsedReport ? 'valid data' : 'null data');
          
          // Format the guest report to match our expected structure
          const formattedReport = {
            id: 'local_' + Date.now(),
            title: parsedReport.jobTitle || 'Job Posting',
            company: parsedReport.company || 'Unknown Company',
            date: new Date().toISOString().split('T')[0],
            score: parsedReport.overallScore || calculateOverallScore(parsedReport),
            status: 'Local',
            data: parsedReport
          };
          
          console.log('[dashboard] Formatted guest report for display:', formattedReport);
          
          // Add to reports array
          reports = [formattedReport, ...reports];
        } catch (err) {
          console.error('[dashboard] Error parsing guest report:', err);
        }
      }
      
      // TODO: Fetch reports from database
      // This would be an API call to get the user's saved reports
      // For now, we'll add some mock data to simulate database reports
      const mockDbReports = [
        {
          id: 'db_1',
          title: 'Senior Software Engineer',
          company: 'TechCorp',
          date: '2025-06-28',
          score: 87,
          status: 'Saved'
        },
        {
          id: 'db_2',
          title: 'Product Manager',
          company: 'InnovateCo',
          date: '2025-06-25',
          score: 72,
          status: 'Saved'
        }
      ];
      
      // Add database reports to our reports array
      reports = [...reports, ...mockDbReports];
      
    } catch (err) {
      console.error('Error fetching reports:', err);
      reportError = 'Failed to load reports. Please try again.';
    } finally {
      loadingReports = false;
    }
  }
  
  // Helper function to calculate overall score from report data
  function calculateOverallScore(report) {
    if (report.overallScore) return report.overallScore;
    
    // If no overall score, calculate from categories if available
    if (report.categories && Array.isArray(report.categories)) {
      const scores = report.categories.map(cat => cat.score || 0);
      if (scores.length > 0) {
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      }
    }
    
    return 0; // Default score if no data available
  }
  
  // Chart data derived from reports
  $: chartData = {
    labels: ['Inclusivity', 'Clarity', 'Tone', 'Requirements', 'Benefits'],
    datasets: [
      {
        label: 'Average Scores',
        data: generateChartData(reports)
      }
    ]
  };
  
  // Generate chart data from reports
  function generateChartData(reportsList) {
    // Default values if no reports
    if (!reportsList || reportsList.length === 0) {
      return [0, 0, 0, 0, 0];
    }
    
    // For real implementation, you would extract category scores from reports
    // For now, generate some values based on the overall scores
    const avgScore = Math.round(reportsList.reduce((sum, report) => sum + report.score, 0) / reportsList.length);
    
    return [
      Math.min(100, avgScore + Math.floor(Math.random() * 10) - 5),  // Inclusivity
      Math.min(100, avgScore + Math.floor(Math.random() * 10) - 5),  // Clarity
      Math.min(100, avgScore + Math.floor(Math.random() * 10) - 5),  // Tone
      Math.min(100, avgScore + Math.floor(Math.random() * 10) - 5),  // Requirements
      Math.min(100, avgScore + Math.floor(Math.random() * 10) - 5)   // Benefits
    ];
  }
  
  onMount(async () => {
    // Initialize the user store
    await user.init();
    
    // Subscribe to user changes
    const unsubscribe = user.subscribe((data) => {
      if (!data) {
        // Redirect to login if not authenticated
        goto('/login');
      } else {
        userData = data;
        userEmail = data.email;
        
        // Fetch the user's reports
        fetchUserReports(data.id);
      }
      loading = false;
    });
    
    return unsubscribe;
  });
  
  function viewReport(reportId) {
    goto(`/results?report=${reportId}`);
  }
  
  function newAudit() {
    goto('/');
  }
</script>

<div class="flex h-screen bg-gray-50">
  <!-- Sidebar -->
  <div class="hidden md:block w-64 border-r border-gray-100">
    <AppSidebar />
  </div>
  
  <!-- Main Content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Top Navigation -->
    <Navbar />
    
    <!-- Main Dashboard Content -->
    <main class="flex-1 overflow-y-auto p-6">
      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      {:else}
        <!-- Dashboard Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">My Dashboard</h1>
            <p class="text-sm text-gray-500">Welcome back, {userEmail}</p>
          </div>
          <Button.Root on:click={newAudit} class="bg-black hover:bg-gray-800 text-white">
            New Audit
          </Button.Root>
        </div>
        
        <Separator.Root class="my-6" />
        
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Total Reports</h3>
            <p class="text-3xl font-semibold">{reports.length}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Average Score</h3>
            <p class="text-3xl font-semibold">{Math.round(reports.reduce((sum, report) => sum + report.score, 0) / reports.length)}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Last Audit</h3>
            <p class="text-3xl font-semibold">{reports.length > 0 ? reports[0].date.split('-')[2] + '/' + reports[0].date.split('-')[1] : 'N/A'}</p>
          </div>
        </div>
        
        <!-- Charts Section -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h2 class="text-lg font-medium mb-4">Score Breakdown</h2>
          <div class="h-64 flex items-center justify-center">
            <!-- Placeholder for chart - in a real app, you'd use a chart library like Chart.js -->
            <div class="w-full h-full flex">
              {#each chartData.labels as label, i}
                <div class="flex-1 flex flex-col items-center">
                  <div class="w-full bg-gray-100 rounded-t-md" style="height: {chartData.datasets[0].data[i] * 0.6}px">
                    <div class="bg-black h-full rounded-t-md" style="width: 80%"></div>
                  </div>
                  <p class="text-xs mt-2 text-gray-500">{label}</p>
                  <p class="text-xs font-medium">{chartData.datasets[0].data[i]}</p>
                </div>
              {/each}
            </div>
          </div>
        </div>
        
        <!-- Reports Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-medium">Your Reports</h2>
            {#if reports.length > 0}
              <span class="text-xs text-gray-500">{reports.length} {reports.length === 1 ? 'report' : 'reports'}</span>
            {/if}
          </div>
          
          {#if loadingReports}
            <div class="p-12 flex justify-center items-center">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          {:else if reportError}
            <Alert.Root class="m-6">
              <Alert.Title>Error loading reports</Alert.Title>
              <Alert.Description>{reportError}</Alert.Description>
            </Alert.Root>
          {:else if reports.length === 0}
            <div class="p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-500 mb-4">No reports yet</p>
              <Button.Root on:click={newAudit} variant="outline" class="text-xs">
                Create your first audit
              </Button.Root>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th class="p-4">Job Title</th>
                    <th class="p-4">Company</th>
                    <th class="p-4">Date</th>
                    <th class="p-4">Score</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  {#each reports as report}
                    <tr class="hover:bg-gray-50">
                      <td class="p-4 whitespace-nowrap">{report.title}</td>
                      <td class="p-4 whitespace-nowrap">{report.company}</td>
                      <td class="p-4 whitespace-nowrap">{report.date}</td>
                      <td class="p-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          {report.score >= 90 ? 'bg-green-100 text-green-800' : 
                           report.score >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                           'bg-red-100 text-red-800'}"
                        >
                          {report.score}
                        </span>
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          {report.status === 'Local' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}"
                        >
                          {report.status}
                        </span>
                      </td>
                      <td class="p-4 whitespace-nowrap">
                        <Button.Root on:click={() => viewReport(report.id)} variant="outline" class="text-xs">
                          View
                        </Button.Root>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      {/if}
    </main>
  </div>
</div>
