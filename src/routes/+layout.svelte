<script lang="ts">
	import '../app.css';
	// Import variable fonts with all weights and styles
	import '@fontsource-variable/playfair-display';
	import '@fontsource-variable/roboto';
	import '@fontsource-variable/quicksand';
	import '@fontsource-variable/geist';
	import '@fontsource-variable/inter';
	import '../lib/font-test.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import CookieBanner from '$lib/components/CookieBanner.svelte';

	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	// PostHog client-side navigation tracking
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

	if (browser) {
		beforeNavigate(() => posthog.capture('$pageleave'));
		afterNavigate(() => posthog.capture('$pageview'));
	}

	let { children } = $props();

	// Check if current route is login or auth callback using $derived (Svelte 5 syntax)
	let isLoginRoute = $derived(
		$page?.route?.id === '/login' || $page?.route?.id?.startsWith('/auth/')
	);

	// Check if current route is results page
	let isResultsRoute = $derived(
		$page?.route?.id === '/results' || $page?.route?.id?.startsWith('/results/')
	);

	onMount(() => {
		return supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN') {
				// Only redirect if we have a guest report
				const guestReport = localStorage.getItem('guest_audit_report');
				if (guestReport) {
					goto('/results');
				} else {
					goto('/dashboard');
				}
			}
		});
	});
</script>

{#if isLoginRoute}
	<Navbar justLogo={true} />
	<div class="flex flex-col h-screen w-full overflow-hidden">
		<main class="bg-white w-full mx-auto flex-grow overflow-auto">
			{@render children?.()}
		</main>
		
		<!-- Cookie consent banner -->
		<CookieBanner />
	</div>
{:else}
	<Sidebar.Provider>
		<div class="flex flex-col min-h-screen w-full max-w-[1600px] mx-auto">
			<Navbar hideLoginButton={isLoginRoute || isResultsRoute} justLogo={false} />

			<!-- Empty space to offset the fixed navbar -->
			<div class="h-16"></div>

			<!-- Main content area with sidebar -->
			<div class="flex flex-grow w-full">
				<!-- Sidebar navigation -->
				<AppSidebar />

				<main class="w-full mt-8 px-4">
					<!-- Main content -->
					{@render children?.()}
				</main>
			</div>
		</div>
		
		<!-- Cookie consent banner -->
		<CookieBanner />
	</Sidebar.Provider>
{/if}
