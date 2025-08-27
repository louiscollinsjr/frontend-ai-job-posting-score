import posthog, { PostHog } from 'posthog-node';
import { env } from '$env/dynamic/public';

let _client: PostHog | null = null;

export function getPostHogClient() {
	if (!_client) {
		_client = new posthog.PostHog(env.PUBLIC_POSTHOG_KEY, {
			host: env.PUBLIC_POSTHOG_HOST
		});
	}
	return _client;
}
