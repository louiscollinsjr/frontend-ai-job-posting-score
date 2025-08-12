<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';  
  import { supabase } from '$lib/supabaseClient';
  import { toast } from 'svelte-sonner';
  import * as Button from '$lib/components/ui/button';
  import * as Alert from '$lib/components/ui/alert';
  import * as Table from '$lib/components/ui/table';
  import * as Checkbox from '$lib/components/ui/checkbox';
  import * as Separator from '$lib/components/ui/separator';
  import Dropdown from '$lib/components/ui/dropdown';
  
  // Data comes from server (page info) and client-side fetching
  export let data;
  
  // Client-side data state
  let reports = [];
  let pagination = { currentPage: data.page, totalPages: 1, totalReports: 0 };
  let reportsWithRewrites = [];
  let reportError = null;
  let userEmail = '';
  let isAuthenticated = false;
  let authChecked = false;
  
  let selectedReports = [];
  let activeDropdown = null;
  let loading = false;
  let dropdownPosition = { top: 0, left: 0 };

  onMount(async () => {
    document.addEventListener('click', handleClickOutside);
    
    // Check authentication and fetch data
    await checkAuthAndFetchData();
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  async function checkAuthAndFetchData() {
    try {
      // Check if user is authenticated via Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        // Not authenticated, redirect to login
        goto('/login');
        return;
      }
      
      isAuthenticated = true;
      userEmail = session.user?.email || 'User';
      authChecked = true;
      
      // Fetch reports data
      await fetchReports(session.access_token);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      goto('/login');
    }
  }

  async function fetchReports(accessToken) {
    try {
      loading = true;
      const apiUrl = `https://ai-audit-api.fly.dev/api/v1/reports?page=${data.page}&limit=${data.limit}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          goto('/login');
          return;
        }
        if (response.status === 404) {
          console.warn('Reports API not found (404). Falling back to Supabase.');
          // Fallback to Supabase direct query
          const pageNum = Number(data.page) || 1;
          const pageSize = Number(data.limit) || 20;
          const from = (pageNum - 1) * pageSize;
          const to = from + pageSize - 1;

          // Determine current user for scoping
          const { data: userData } = await supabase.auth.getUser();
          const currentUserId = userData?.user?.id;

          // Get total count
          const { count } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('userid', currentUserId);

          // Get paginated items for current user
          const { data: sbData, error: sbError } = await supabase
            .from('reports')
            .select('*')
            .eq('userid', currentUserId)
            .order('savedat', { ascending: false })
            .range(from, to);

          if (sbError) {
            console.error('Supabase fallback failed:', sbError);
            reportError = 'Failed to load reports. Please try again later.';
          } else {
            reports = sbData || [];
            pagination = {
              currentPage: pageNum,
              totalPages: count ? Math.max(1, Math.ceil(count / pageSize)) : 1,
              totalReports: count || (sbData ? sbData.length : 0)
            };
            reportError = null;
          }

          return; // Exit after fallback
        }
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Handle both old and new API response formats
      if (Array.isArray(responseData)) {
        // Old API format - simulate pagination
        reports = responseData;
        pagination = {
          currentPage: data.page,
          totalPages: Math.ceil(responseData.length / data.limit),
          totalReports: responseData.length
        };
      } else {
        // New API format with pagination
        reports = responseData.reports || [];
        pagination = {
          currentPage: responseData.currentPage || data.page,
          totalPages: responseData.totalPages || 1,
          totalReports: responseData.totalReports || 0
        };
      }

      // Fetch reports with rewrites
      try {
        const rewriteResponse = await fetch('https://ai-audit-api.fly.dev/api/v1/reports/with-rewrites', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (rewriteResponse.ok) {
          const rewriteData = await rewriteResponse.json();
          reportsWithRewrites = rewriteData.reportIds || rewriteData || [];
        }
      } catch (error) {
        console.warn('Failed to fetch rewrite data:', error);
      }
      
      reportError = null;
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Do not hard fail the page; show a friendly error
      reportError = 'Failed to load reports. Please try again.';
    } finally {
      loading = false;
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
  
  // Normalization helpers so we can handle multiple API shapes consistently
  function getTitle(r) {
    return r.title || r.job_title || r.jobTitle || r.jobtitle || 'Untitled';
  }
  function getCompany(r) {
    return r.company || r.company_name || r.companyName || 'N/A';
  }
  function getDate(r) {
    const d = r.date || r.created_at || r.createdAt || r.savedat;
    try {
      return d ? new Date(d).toLocaleDateString() : 'N/A';
    } catch {
      return 'N/A';
    }
  }
  function getScore(r) {
    // Prefer DB field when present
    const dbScore = r.totalscore ?? r.total_score;
    if (typeof dbScore === 'number') return dbScore;
    // API shapes
    const apiScore = r.overallScore ?? r.score;
    if (typeof apiScore === 'number') return apiScore;
    // Sometimes original payload is stored in jsonb
    const origScore = r.originalreport?.total_score ?? r.originalreport?.overallScore ?? r.original_report?.total_score ?? r.original_report?.overallScore;
    if (typeof origScore === 'number') return origScore;
    // Fallback: compute from categories
    return calculateOverallScore(r) ?? 0;
  }

  // Report action functions
  function viewReport(reportId) {
    goto(`/results?report=${reportId}`);
  }

  async function improveReport(reportId) {
    loading = true;
    try {
      const sessionStr = localStorage.getItem('sb-zincimrcpvxtugvhimny-auth-token');
      if (!sessionStr) {
        toast.error('Authentication required');
        return;
      }

      const session = JSON.parse(sessionStr);
      const response = await fetch(`https://ai-audit-api.fly.dev/api/v1/rewrite-job/${reportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Report improvement started!');
        goto(`/results?report=${reportId}`);
      } else {
        toast.error('Failed to improve report');
      }
    } catch (error) {
      console.error('Error improving report:', error);
      toast.error('Error improving report');
    } finally {
      loading = false;
    }
  }

  async function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    loading = true;
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report deleted successfully');
      // Refresh the page to update the reports list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    } finally {
      loading = false;
    }
  }

  function viewRewriteHistory(reportId) {
    goto(`/rewrite-history?report=${reportId}`);
  }

  function viewJsonLd(reportId) {
    goto(`/json-ld?report=${reportId}`);
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

  async function archiveSelected() {
    if (selectedReports.length === 0) return;

    loading = true;
    try {
      const { error } = await supabase
        .from('reports')
        .update({ archived: true })
        .in('id', selectedReports);

      if (error) throw error;

      toast.success(`${selectedReports.length} reports archived`);
      selectedReports = [];
      // Refresh the page to update the reports list
      window.location.reload();
    } catch (error) {
      console.error('Error archiving reports:', error);
      toast.error('Failed to archive reports');
    } finally {
      loading = false;
    }
  }

  function handleClickOutside(event) {
    if (activeDropdown && !event.target.closest('[data-dropdown-trigger]')) {
      activeDropdown = null;
    }
  }

  function toggleDropdown(reportId, event) {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (activeDropdown === reportId) {
      activeDropdown = null;
    } else {
      activeDropdown = reportId;
    }
  }

  function positionDropdown(node, reportId) {
    if (activeDropdown === reportId) {
      const trigger = document.querySelector(`[data-dropdown-trigger="${reportId}"]`);
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        node.style.top = `${rect.bottom + window.scrollY + 5}px`;
        node.style.left = `${rect.right + window.scrollX - node.offsetWidth}px`;
      }
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="flex min-h-screen w-full relative z-10">
  <!-- Main Content -->
  <div class="flex-1 p-8 w-full pt-32 max-w-7xl relative z-10">
    <!-- Dashboard Header -->
    <div class="flex justify-between items-center mb-10 w-full">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">JobPostScore Dashboard</h1>
        <p class="text-sm text-gray-500">Welcome back 👋, {userEmail}</p>
      </div>
      <Button.Root on:click={() => goto('/')} variant="default" size="sm" class="bg-black hover:bg-gray-800 text-white">
        New JobPostScore
      </Button.Root>
    </div>
    
    <Separator.Root class="my-12" />
    
    {#if reportError}
      <Alert.Root class="mb-6">
        <Alert.Description>
          {reportError}
        </Alert.Description>
      </Alert.Root>
    {:else}
      <!-- Reports Table -->
      <div class="bg-transparent rounded-lg shadow-none w-full pb-32">
        <div class="p-6 pl-2 border-0 border-gray-100 flex flex-col sm:flex-row justify-between gap-4 w-full">
          <div class="">
            <h2 class="text-base font-medium text-gray-700">Your Reports</h2>
            {#if reports.length > 0}
              <p class="text-sm text-gray-500 mt-1">
                Showing {reports.length} of {pagination.totalReports} report{pagination.totalReports === 1 ? '' : 's'}
              </p>
            {/if}
          </div>
          
          {#if selectedReports.length > 0}
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{selectedReports.length} selected</span>
              <Button.Root on:click={archiveSelected} variant="outline" size="sm" class="text-xs">
                Archive Selected
              </Button.Root>
            </div>
          {/if}
        </div>
        
        <div class="w-full">
          {#if reports.length === 0}
            <div class="p-12 text-center min-h-[300px] flex flex-col justify-center items-center">
              <p class="text-gray-500 mb-4">No reports found. Start by creating your first JobPostScore!</p>
              <Button.Root on:click={() => goto('/')} variant="default" size="sm" class="bg-black hover:bg-gray-800 text-white">
                Create Report
              </Button.Root>
            </div>
          {:else}
            <div class="border-2 border-black rounded-lg w-full overflow-visible">
              <Table.Root class="w-full">
                <Table.Header class="text-xs">
                  <Table.Row class="">
                    <Table.Head class="w-[5%]">
                      <Checkbox.Root class="ml-2"
                        checked={selectedReports.length === reports.length && reports.length > 0}
                        on:click={toggleSelectAll}
                      />
                    </Table.Head>
                    <Table.Head class="w-auto">Job Title</Table.Head>
                    <Table.Head class="w-28 whitespace-nowrap">Date</Table.Head>
                    <Table.Head class="w-20 text-center">Score</Table.Head>
                    <Table.Head class="w-10 text-right">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body class="text-xs">
                  {#each reports as report}
                    <Table.Row 
                      class="hover:bg-gray-50 cursor-pointer"
                      role="button"
                      tabindex="0"
                      on:click={() => viewReport(report.id)}
                      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); viewReport(report.id); } }}
                    >
                      <Table.Cell class="p-4">
                        <Checkbox.Root 
                          checked={selectedReports.includes(report.id)}
                          on:click={(e) => { e.stopPropagation(); toggleSelectReport(report.id); }}
                        />
                      </Table.Cell>
                      <Table.Cell class="font-normal text-[10px] w-auto">
                        <a href={`/results?report=${report.id}`} class="block py-3 -my-3 hover:underline">
                          {getTitle(report)}
                        </a>
                      </Table.Cell>
                      <Table.Cell class="text-[10px] w-28 whitespace-nowrap">
                        <a href={`/results?report=${report.id}`} class="block py-3 -my-3 hover:underline">
                          {getDate(report)}
                        </a>
                      </Table.Cell>
                      <Table.Cell class="text-center w-20">
                        <a href={`/results?report=${report.id}`} class="inline-block">
                        <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] 
                          {getScore(report) >= 90 ? 'bg-black text-white' : 
                          getScore(report) >= 70 ? 'bg-black text-white' : 
                          'bg-black text-white'}"
                        >
                          {getScore(report)}
                        </div>
                        </a>
                      </Table.Cell>
                      <Table.Cell class="text-right w-10">
                        <div class="relative" data-row-action on:click|stopPropagation on:mousedown|stopPropagation on:keydown|stopPropagation>
                          <button
                            class="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            data-dropdown-trigger={report.id}
                            on:click={(e) => toggleDropdown(report.id, e)}
                            on:mousedown|stopPropagation
                            on:keydown|stopPropagation
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
                          </button>
                          
                          {#if activeDropdown === report.id}
                            <div 
                              class="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[9999]"
                              use:positionDropdown={report.id}
                              on:click|stopPropagation
                            >
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
                              {#if reportsWithRewrites && reportsWithRewrites.includes(report.id)}
                                <button 
                                  class="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm flex items-center"
                                  on:click={() => { viewRewriteHistory(report.id); activeDropdown = null; }}
                                >
                                  <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                  Previous Rewrites
                                </button>
                              {/if}
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
                          {/if}
                        </div>
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

    <!-- Pagination Controls -->
    {#if pagination && pagination.totalPages > 1}
      <div class="flex justify-center items-center gap-4 mt-8">
        <Button.Root 
          href={`/dashboard?page=${pagination.currentPage - 1}`} 
          disabled={pagination.currentPage <= 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button.Root>
        
        <span class="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        
        <Button.Root 
          href={`/dashboard?page=${pagination.currentPage + 1}`} 
          disabled={pagination.currentPage >= pagination.totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button.Root>
      </div>
    {/if}
  </div>
</div>
