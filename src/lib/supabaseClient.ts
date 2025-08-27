 import { createClient } from '@supabase/supabase-js';
 import { env } from '$env/dynamic/public';

 // Create and export a single shared Supabase client for the app
 export const supabase = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
