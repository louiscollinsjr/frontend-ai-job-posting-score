import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Enable vitePreprocess with explicit PostCSS configuration
	preprocess: vitePreprocess({
		postcss: true, // Ensure PostCSS processing is explicitly enabled
	}),
	kit: {
		adapter: adapter()
	}
};

export default config;
