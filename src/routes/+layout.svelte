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
    <div class="print:hidden"><Navbar justLogo={true} /></div>
	<div class="flex flex-col h-screen w-full overflow-hidden">
		<main class="bg-white w-full mx-0 flex-grow overflow-auto">
			{@render children?.()}
		</main>
		
		        <!-- Cookie consent banner -->
        <div class="print:hidden"><CookieBanner /></div>
	</div>
{:else}
	    <Sidebar.Provider open={true}>
        <div class="flex flex-col min-h-screen w-full bg-[#ffffff] overflow-x-hidden print:bg-white p-0 sm:p-0">
            <div class="absolute inset-0 bg-no-repeat bg-contain sm:bg-cover bg-center blur-lg opacity-90 z-0 print:hidden"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-[#f8f8f8]/0 via-[#f8f8f8]/0 to-[#f8f8f8]/0 2xl:from-[#f8f8f8]/0 2xl:via-[#f8f8f8]/0 2xl:to-[#f8f8f8]/0 z-0 print:hidden"></div>
            <div class="print:hidden"><Navbar hideLoginButton={isLoginRoute} justLogo={false} /></div>

			<!-- Main content area with sidebar -->
			<div class="flex flex-grow w-full transition-all duration-200 ease-in-out print:block">
				<!-- Sidebar navigation -->
				<div class="print:hidden"><AppSidebar /></div>

				<main class="flex-1 min-w-0 transition-all duration-200 ease-in-out mx-0 sm:mx-auto max-w-[1600px] w-full px-0 z-10 print:max-w-none print:px-0 print:w-full">
					{@render children?.()}
				</main>
			</div>
        </div>
		
		<!-- Cookie consent banner -->
		<div class="print:hidden"><CookieBanner /></div>
	</Sidebar.Provider>
{/if}
