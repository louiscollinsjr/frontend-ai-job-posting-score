<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import * as Button from '$lib/components/ui/button';
  import * as Alert from '$lib/components/ui/alert';
  import * as Table from '$lib/components/ui/table';
  import * as Checkbox from '$lib/components/ui/checkbox';
  import * as Separator from '$lib/components/ui/separator';
  import Dropdown from '$lib/components/ui/dropdown';
  import { reportsStore } from '$lib/stores/reports';
  
  let reports = [];
  let loadingReports = false;
  let reportError = null;
  let selectedReports = [];
  let activeDropdown = null;
  let userEmail = '';
  let loading = false; // Initialize the loading variable
  
  // Subscribe to the reports store
  const unsubscribe = reportsStore.subscribe(state => {
    reports = state.reports;
    loadingReports = state.loading;
    reportError = state.error;
  });
  
  onMount(async () => {
    // Get user from localStorage
    try {
      const sessionStr = localStorage.getItem('sb-zincimrcpvxtugvhimny-auth-token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        userEmail = session.user?.email || 'User';
      }
      
      // Try to load from cache first
      const cachedReports = reportsStore.getCachedReports();
      if (cachedReports) {
        reportsStore.setReports(cachedReports);
      } else {
        // No cache, fetch fresh data
        await fetchUserReports();
      }
    } catch (error) {
      console.error('Error loading user data', error);
    }
    
    return () => {
      // Clean up subscription when component is destroyed
      unsubscribe();
    };
  });
  
  async function fetchUserReports() {
    reportsStore.setLoading(true);
    reportsStore.setError(null);
    
    try {
      const token = JSON.parse(localStorage.getItem('sb-zincimrcpvxtugvhimny-auth-token'))?.access_token;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('https://ai-audit-api.fly.dev/api/v1/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      reportsStore.setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      reportsStore.setError(error.message);
    } finally {
      reportsStore.setLoading(false);
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
  
  // Report action functions
  function viewReport(reportId) {
    goto(`/results?report=${reportId}`);
  }
  
  function improveReport(reportId) {
    goto(`/rewrite?report=${reportId}`);
  }
  
  function viewJsonLd(reportId) {
    goto(`/json-ld?report=${reportId}`);
  }
  
  function deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this report?')) {
      // Here you would call the API to delete the report
      reports = reports.filter(report => report.id !== reportId);
      selectedReports = selectedReports.filter(id => id !== reportId);
    }
  }
  
  function archiveSelected() {
    if (selectedReports.length === 0) return;
    if (confirm(`Are you sure you want to archive ${selectedReports.length} reports?`)) {
      // Here you would call the API to archive the selected reports
      console.log('Archiving reports:', selectedReports);
      selectedReports = [];
    }
  }
  
  function toggleSelectReport(reportId) {
    if (selectedReports.includes(reportId)) {
      selectedReports = selectedReports.filter(id => id !== reportId);
    } else {
      selectedReports = [...selectedReports, reportId];
    }
  }
  
  function toggleSelectAll() {
    if (selectedReports.length === reports.length) {
      selectedReports = [];
    } else {
      selectedReports = reports.map(report => report.id);
    }
  }
  
  function toggleDropdown(reportId) {
    if (activeDropdown === reportId) {
      activeDropdown = null;
    } else {
      activeDropdown = reportId;
    }
  }
  
  function newAudit() {
    goto('/');
  }
</script>

<div class="flex h-screen bg-white">
  <!-- Sidebar -->
  <!-- <div class="hidden md:block w-64 border-r border-gray-100">
    <AppSidebar />
  </div> -->
  
  <!-- Main Content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Top Navigation -->
   
    
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
            <h1 class="text-2xl font-bold text-gray-900">JobPostScore Dashboard</h1>
            <p class="text-sm text-gray-500">Welcome back 👋, {userEmail}</p>
          </div>
          <Button.Root on:click={newAudit} variant="default"
          size="sm" class="bg-black hover:bg-gray-800 text-white">
            New Audit
          </Button.Root>
        </div>
        
        <Separator.Root class="my-6" />
        
        <!-- Reports Table -->
        <div class="bg-white rounded-lg shadow-md border border-gray-100 w-full">
          <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 w-full">
            <div class="">
              <h2 class="text-lg font-bold">JobPostScore Reports</h2>
              {#if reports.length > 0 && !loadingReports}
                <span class="text-xs text-gray-500">{reports.length} {reports.length === 1 ? 'report' : 'reports'}</span>
              {/if}
            </div>
            
            {#if selectedReports.length > 0 && !loadingReports}
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{selectedReports.length} selected</span>
                <Button.Root on:click={archiveSelected} variant="outline" size="sm" class="text-xs">
                  Archive Selected
                </Button.Root>
              </div>
            {/if}
          </div>
          
          <!-- Table Container with fixed dimensions to prevent layout shifts -->
          <div class="w-full overflow-hidden"> <!-- This wrapper maintains consistent width -->
            {#if loadingReports}
              <div class="p-12 flex justify-center items-center min-h-[300px]">
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-gray-500">No reports found.</p>
                <Button.Root on:click={newAudit} variant="outline" class="mt-4">
                  Start New Audit
                </Button.Root>
              </div>
            {:else}
              <div>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="w-[40px]">
                        <Checkbox.Root
                          checked={selectedReports.length === reports.length && reports.length > 0}
                          on:click={toggleSelectAll}
                        />
                      </Table.Head>
                      <Table.Head class="w-[80px]">ID</Table.Head>
                      <Table.Head>Job Title</Table.Head>
                      <Table.Head>Company</Table.Head>
                      <Table.Head>Date</Table.Head>
                      <Table.Head>Score</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head class="text-right">Actions</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each reports as report}
                      <Table.Row class="hover:bg-gray-50">
                        <Table.Cell class="p-4">
                          <Checkbox.Root 
                            checked={selectedReports.includes(report.id)}
                            on:click={() => toggleSelectReport(report.id)}
                          />
                        </Table.Cell>
                        <Table.Cell class="font-mono text-xs">{report.id ? report.id.substring(0, 8) : 'N/A'}</Table.Cell>
                        <Table.Cell class="font-medium">{report.title || 'Untitled'}</Table.Cell>
                        <Table.Cell>{report.company || 'N/A'}</Table.Cell>
                        <Table.Cell>{report.date || 'N/A'}</Table.Cell>
                        <Table.Cell>
                          <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            {report.score >= 90 ? 'bg-green-100 text-green-800' : 
                            report.score >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}"
                          >
                            {report.score || 0}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            {report.status === 'Local' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}"
                          >
                            {report.status || 'Unknown'}
                          </div>
                        </Table.Cell>
                        <Table.Cell class="text-right">
                          <Dropdown 
                            open={activeDropdown === report.id} 
                            on:close={() => { activeDropdown = null; }}
                          >
                            <div slot="trigger">
                              <Button.Root 
                                variant="outline" 
                                size="sm"
                                class="h-8 w-8 p-0" 
                                on:click={() => toggleDropdown(report.id)}
                              >
                                <span class="sr-only">Open menu</span>
                                <svg 
                                  width="15" 
                                  height="15" 
                                  viewBox="0 0 15 15" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  class="h-4 w-4"
                                >
                                  <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>
                                </svg>
                              </Button.Root>
                            </div>
                            <div class="min-w-[160px] py-1">
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm flex items-center"
                                on:click={() => { viewReport(report.id); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                View
                              </button>
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm flex items-center"
                                on:click={() => { improveReport(report.id); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Improve
                              </button>
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm flex items-center"
                                on:click={() => { viewJsonLd(report.id); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                JSON-LD
                              </button>
                              <div class="my-1 h-px bg-gray-100"></div>
                              <button 
                                class="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-sm flex items-center"
                                on:click={() => { deleteReport(report.id); activeDropdown = null; }}
                              >
                                <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                Delete
                              </button>
                            </div>
                          </Dropdown>
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              </div>
            {/if}
          </div>  
        </div>
      {/if}  
    </main>
  </div>
</div>
