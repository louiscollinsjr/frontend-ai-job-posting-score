import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  // Only run on the client side
  if (browser) {
    // Check if we have a session in localStorage
    const session = localStorage.getItem('sb-zincimrcpvxtugvhimny-auth-token');
    
    if (!session) {
      // No session found, redirect to login
      throw redirect(302, '/login');
    }
    
    // We have a session, let the page load
    return {};
  }
  
  // Server-side, we'll let the page component handle auth
  return {};
}
