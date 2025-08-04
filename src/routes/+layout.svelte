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
			// Removed automatic redirection to let the auth callback handle it
			// This prevents the unwanted redirect to /results when the page loads
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
	<Sidebar.Provider open={false}>
		<div class="flex flex-col min-h-screen w-full bg-[#f8f8f8] overflow-x-hidden">
			<div
			class="absolute inset-0 bg-[url('/bkg2.png')] bg-no-repeat bg-contain sm:bg-cover bg-center blur-lg opacity-90"
		></div>
		<div
			class="absolute inset-0 bg-gradient-to-b from-[#f8f8f8]/0 via-[#f8f8f8]/0 to-[#f8f8f8]/0 2xl:from-[#f8f8f8]/0 2xl:via-[#f8f8f8]/0 2xl:to-[#f8f8f8]/0"
		></div>
			<Navbar hideLoginButton={isLoginRoute} justLogo={false} />

			<!-- Main content area with sidebar -->
			<div class="flex flex-grow w-full transition-all duration-200 ease-in-out">
				<!-- Sidebar navigation -->
				<AppSidebar class="flex-shrink-0" />

				<main class="flex-1 min-w-0 transition-all duration-200 ease-in-out mx-auto max-w-[1600px] w-full px-4">
					{@render children?.()}
				</main>
			</div>
		</div>
		
		<!-- Cookie consent banner -->
		<CookieBanner />
	</Sidebar.Provider>
{/if}
