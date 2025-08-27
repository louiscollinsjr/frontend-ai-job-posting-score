import posthog from 'posthog-js';
import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';

export const load = async () => {
    if (!browser) return;

    // Do not initialize analytics in development (avoids CORS noise on localhost)
    if (dev) return;

    // Only initialize if user has accepted analytics in the cookie banner
    try {
        const consent = localStorage.getItem('analytics-consent');
        if (consent === 'accepted' && env.PUBLIC_POSTHOG_KEY && env.PUBLIC_POSTHOG_HOST) {
            posthog.init(env.PUBLIC_POSTHOG_KEY, {
                api_host: env.PUBLIC_POSTHOG_HOST,
                capture_pageview: false,
                capture_pageleave: false,
                capture_exceptions: true
            });
        }
    } catch (_) {
        // ignore localStorage access issues
    }
    return;
};
