<script>
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import ScoreVisualizer from '$lib/components/ScoreVisualizer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Logo from '$lib/components/Logo.svelte';

	// Create a dispatcher for events
	const dispatch = createEventDispatcher();

	// Props for the results display
	export let results = null; // Results data from the audit
	export let loading = false; // Loading state
	export let isLoggedIn = false; // Authentication state

	let rewriteLoading = false;

	// Format the API response for new 7-category, 100-point rubric
	$: processedResults = results && {
		...results,
		overallScore: results.total_score || results.overallScore || 0,
		categories: results.categories || {},
		red_flags: results.red_flags || [],
		recommendations: results.recommendations || []
	};

	// Function to determine which score background to use based on score value
	function getScoreBackground(score) {
		if (score >= 96.0) return '/green-score.svg';
		if (score >= 75.0) return '/yellow-score.svg';
		return '/red-score.svg';
	}

	// Category display order and labels
	const categoryLabels = [
		{ key: 'clarity', label: 'Clarity & Readability', max: 20 },
		{ key: 'promptAlignment', label: 'Prompt Alignment', max: 20 },
		{ key: 'structuredData', label: 'Structured Data Presence', max: 15 },
		{ key: 'recency', label: 'Recency & Freshness', max: 10 },
		{ key: 'keywordTargeting', label: 'Keyword Targeting', max: 15 },
		{ key: 'compensation', label: 'Compensation Transparency', max: 10 },
		{ key: 'pageContext', label: 'Page Context & Cleanliness', max: 10 }
	];

	function getScoreColor100(score, max) {
		const pct = score / max;
		if (pct >= 0.85) return 'text-green-600';
		if (pct >= 0.6) return 'text-yellow-600';
		if (pct >= 0.4) return 'text-orange-500';
		return 'text-red-600';
	}

	// Function to get score color
	function getScoreColor(score) {
		if (score >= 4) return 'text-green-600';
		if (score >= 3) return 'text-yellow-600';
		if (score >= 2) return 'text-orange-500';
		return 'text-red-600';
	}

	// Function to analyze another job posting
	function analyzeAnother() {
		dispatch('close');
		// Navigate back to form
		window.history.back();
	}

	// Function to print report (user can save as PDF)
	function downloadReport() {
		// Hide action buttons during print
		const actionButtons = document.querySelectorAll(
			'.flex.flex-wrap.justify-center.gap-4.mt-8.bg-gray-100'
		);
		actionButtons.forEach((button) => {
			button.style.display = 'none';
		});

		// Trigger browser print dialog
		window.print();

		// Restore action buttons after print dialog
		setTimeout(() => {
			actionButtons.forEach((button) => {
				button.style.display = '';
			});
		}, 100);
	}

	// Helper function to download JSON data as a file
	function downloadJsonFile(jsonData, filename) {
		const blob = new Blob([jsonData], { type: 'application/ld+json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Function to download job data as JSON-LD schema.org/JobPosting
	async function downloadJobData() {
		const originalButtonText = document.getElementById('downloadButton').innerText;
		document.getElementById('downloadButton').innerText = 'Generating...';

		try {
			// First check if we have JSON-LD in the passed results
			if (results?.json_ld) {
				console.log('Found JSON-LD in results:', results.json_ld);
				downloadJsonFile(
					JSON.stringify(results.json_ld, null, 2),
					`job_${results.id}_schema.jsonld`
				);
				return;
			}

			// Get job ID from results, or check store, or fallback to localStorage
			let jobId = results?.id;

			if (!jobId) {
				// Try to get from local storage
				jobId = localStorage.getItem('last_job_id');
				console.log('Using job ID from localStorage:', jobId);
			}

			if (!jobId) {
				throw new Error('No job ID available');
			}

			console.log('Fetching JSON-LD for job ID:', jobId);

			// Try to get directly from Supabase first
			try {
				const { data, error } = await supabase
					.from('reports')
					.select('json_ld')
					.eq('id', jobId)
					.single();

				if (data?.json_ld) {
					console.log('Retrieved JSON-LD from Supabase');
					downloadJsonFile(JSON.stringify(data.json_ld, null, 2), `job_${jobId}_schema.jsonld`);
					return;
				}
			} catch (err) {
				console.warn('Error fetching from Supabase:', err);
			}

			// If Supabase failed, try the API
			console.log('Falling back to API endpoint for JSON-LD generation');

			// Fetch JSON-LD directly from the dedicated generator endpoint
			let response = await fetch(`https://ai-audit-api.fly.dev/api/v1/generate-jsonld/${jobId}`, {
				method: 'GET',
				headers: { Accept: 'application/ld+json, application/json' }
			});

			// Fallback to unversioned route if versioned path is not found on the server yet
			if (response.status === 404) {
				console.warn('v1 generate-jsonld route not found (404). Falling back to /api/generate-jsonld');
				response = await fetch(`https://ai-audit-api.fly.dev/api/generate-jsonld/${jobId}`, {
					method: 'GET',
					headers: { Accept: 'application/ld+json, application/json' }
				});
			}

			if (!response.ok) {
				throw new Error(`Failed to fetch JSON-LD: ${response.status} ${response.statusText}`);
			}

			const json_ldData = await response.json();

			if (!json_ldData) {
				throw new Error('No JSON-LD data received');
			}

			// Trigger download
			downloadJsonFile(JSON.stringify(json_ldData, null, 2), `job_${jobId}_schema.jsonld`);
		} catch (error) {
			console.error('Error downloading JSON-LD data:', error);
			alert(`Failed to download JSON-LD: ${error.message}`);
		} finally {
			document.getElementById('downloadButton').innerText = originalButtonText;
		}
	}

	async function handleRewrite() {
		rewriteLoading = true;
		try {
			// Check for a valid job ID
			let jobId = results?.id || localStorage.getItem('last_job_id');

			// If no job ID, try to save the job first
			if (!jobId && isLoggedIn) {
				console.log('No job ID found, saving job first...');
				try {
					// Save the job directly to Supabase
					const { data, error } = await supabase
						.from('reports')
						.insert([
							{
								userid: (await supabase.auth.getUser()).data.user?.id,
								job_title: results.job_title || 'Untitled Job',
								job_body: results.job_body || results.original_text || '',
								feedback: results.feedback || '',
								total_score: results.total_score || 0,
								categories: results.categories || {},
								recommendations: results.recommendations || [],
								red_flags: results.red_flags || [],
								savedat: new Date().toISOString(),
								source: results.source || 'web_app',
								original_text: results.job_body || results.original_text || '',
								original_report: JSON.stringify(results)
							}
						])
						.select('id')
						.single();

					if (error) throw error;

					jobId = data.id;
					console.log('Job successfully saved with ID:', jobId);
					localStorage.setItem('last_job_id', jobId);

					// Update the results object with the new ID
					results.id = jobId;
				} catch (saveError) {
					console.error('Failed to save job before rewrite:', saveError);
					throw new Error('Unable to save job before improving. Please try again.');
				}
			}

			if (!jobId) {
				throw new Error(
					'No job ID available. Please save the job first or log in to use this feature.'
				);
			}

			console.log('Improving job posting with ID:', jobId);

			// Use the full fly.io URL instead of relative path
			const response = await fetch(`https://ai-audit-api.fly.dev/api/v1/rewrite-job/${jobId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ saveToDatabase: true })
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`API returned ${response.status}: ${errorText}`);
			}

			const data = await response.json();
			dispatch('rewrite', data);
		} catch (error) {
			console.error('Rewrite failed:', error);
			alert(`Failed to improve job posting: ${error.message}`);
		} finally {
			rewriteLoading = false;
		}
	}
</script>

<div class="results-page pb-32 bg-[#f8f8f8]/0">
	<!-- Main content area -->
	<div class="max-w-2xl mx-auto pb-8 px-4">
		{#if loading}
			<div class="flex flex-col items-center justify-center py-12">
				<svg
					class="animate-spin h-10 w-10 text-indigo-600 mb-4"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<p class="text-lg text-gray-600">Analyzing your job posting...</p>
			</div>
		{:else if processedResults}
			{#if isLoggedIn}
				<!-- Full Score Visualizer and detailed breakdown for authenticated users -->
				<div class="space-y-4 mb-2">
					<ScoreVisualizer
						score={processedResults?.overallScore || 0}
						categories={processedResults?.categories || {}}
						{categoryLabels}
					/>

					<!-- Suggestions Panel -->
					<div
						class="mt-2 p-6 bg-white rounded-lg shadow-sm border border-r-2 border-black border-b-2"
					>
						<h3 class="text-xl font-bold uppercase mb-3">Improvement Suggestions</h3>
						{#if processedResults.job_title}
							<div class="mb-4 text-gray-400">
								<p class="font-normal text-xs">Job Title: {processedResults.job_title}</p>
								<!--job uuid -->
								<p class="font-normal text-xs">JobPostScore ID: {processedResults.id}</p>
							</div>
						{/if}
						{#each categoryLabels as cat}
							{#if processedResults.categories?.[cat.key]?.suggestions?.length}
								<div class="mb-4">
									<h4 class="font-medium text-sm mb-1">{cat.label}</h4>
									<ul class="list-disc pl-4 text-sm text-gray-700">
										{#each processedResults.categories[cat.key].suggestions as sugg}
											<li class="mb-1">{sugg}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Action buttons -->
				<div class="flex flex-wrap justify-center gap-4 mt-8 bg-gray-100 p-6 rounded-lg py-12">
					<Button variant="default" size="sm" on:click={downloadReport}>Download Report</Button>

					<Button variant="default" size="sm" id="downloadButton" on:click={downloadJobData}>
						Download JSON-LD Data
					</Button>

					<!-- if enterprise account-->
					<Button
						variant="default"
						size="sm"
						on:click={handleRewrite}
						disabled={rewriteLoading || loading}
					>
						{rewriteLoading ? 'Improving...' : 'Improve This Posting'}
					</Button>
				</div>
			{:else}
				<!-- Always show the score prominently with progress circle -->
				<div class="text-center mb-8">
					<h1
						class="text-3xl mb-2 whitespace-nowrap flex items-center justify-center gap-2 leading-none"
					>
						<Logo variant="black" alt="JobPostScore" imgClass="h-7 sm:h-10 w-auto align-middle" />
						<span class="align-middle">Analysis</span>
					</h1>
					<p class="text-center text-gray-600 mb-12 text-xs">
						Here's how your job posting performed across key metrics
					</p>
					<div class="relative flex justify-center">
						<div class="relative w-64 h-64">
							<!-- SVG Circle Progress -->
							<svg class="w-full h-full" viewBox="0 0 100 100">
								<!-- Background circle -->
								<circle cx="50" cy="50" r="42" stroke="#e5e7eb" stroke-width="8" fill="none" />
								<!-- Progress circle -->
								<circle
									cx="50"
									cy="50"
									r="42"
									stroke="#000000"
									stroke-width="8"
									fill="none"
									stroke-linecap="round"
									stroke-dasharray={2 * Math.PI * 42}
									stroke-dashoffset={2 * Math.PI * 42 -
										((processedResults?.overallScore || 0) / 100) * 2 * Math.PI * 42}
									transform="rotate(-90 50 50)"
									class="transition-all duration-1000 ease-in-out"
								/>
							</svg>

							<!-- Score value -->
							<div class="absolute inset-0 flex flex-col items-center justify-center">
								<span class="text-3xl sm:text-7xl font-bold text-black"
									>{Math.round(processedResults?.overallScore || 0)}</span
								>
								<span class="text-xs text-gray-500">(0-100)</span>
							</div>
						</div>
					</div>

					<h3
						class="text-[23px] font-bold text-gray-800 mb-2 flex items-center justify-center gap-1 mt-16"
					>
						Your <Logo
							variant="black"
							alt="JobPostScore"
							imgClass="h-7 sm:h-7 w-auto align-middle ml-1"
						/><span class="">Score</span>
					</h3>
					<!-- <p class="text-gray-600">Job Post Visibility & Quality Index</p> -->
					{#if processedResults.job_title}
						<div class="mb-4 text-gray-400">
							<p class="font-normal text-xs">Job Title: {processedResults.job_title}</p>
							<!--job uuid -->
							<p class="font-normal text-xs">JobPostScore ID: {processedResults.id}</p>
						</div>
					{/if}
				</div>
				<!-- Magic link gate for detailed analysis -->
				<div
					class="bg-gray-50 border border-black border-b-2 border-r-2 rounded-lg p-8 py-20 mt-24 mb-16 text-center"
				>
					<div class="mb-6">
						<!-- <svg class="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg> -->
						<h3
							class="text-[23px] font-bold text-gray-800 mb-2 flex items-center justify-center gap-1"
						>
							Unlock Your <Logo
								variant="black"
								alt="JobPostScore"
								imgClass="h-7 sm:h-7 w-auto align-middle ml-1"
							/><span class="">Report</span>
						</h3>
						<p class="text-gray-600 mb-6">
							Get detailed category breakdowns, specific improvement suggestions, and actionable
							insights to optimize your job posting.
						</p>
					</div>

					<div class="space-y-4">
						<button
							class="bg-black text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
							on:click={() => dispatch('accesslater')}
						>
							Get complete report
						</button>
						<p class="text-sm text-gray-500">
							We'll send you a magic link to access your complete analysis
						</p>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Fallback for no results shown inside component -->

<style>
</style>
