/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  // Get current page from URL, default to 1
  const page = Number(url.searchParams.get('page') || '1');
  const limit = 20; // Reports per page

  // Return page info for client-side fetching
  // Authentication is handled client-side since Supabase stores sessions in localStorage
  return {
    page,
    limit,
    needsClientAuth: true
  };
}
