<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/stores/auth.js';
  import { browser } from '$app/environment';
  import { createEventDispatcher } from 'svelte';

  // Dispatch events for parent components
  const dispatch = createEventDispatcher();
  
  // Props
  export let compact = false; // Whether to use compact mode for dialogs

  let email = '';
  let loading = false;
  let error = '';
  let success = '';
  let termsAccepted = false;

  // List of common public/free email domains
  const blockedDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'protonmail.com', 'mail.com', 'gmx.com', 'zoho.com',
    'yandex.com', 'msn.com', 'live.com', 'me.com', 'pm.me', 'fastmail.com',
    'inbox.com', 'rocketmail.com', 'qq.com', '163.com', '126.com', 'sina.com',
    'rediffmail.com', 'naver.com', 'hanmail.net', 'daum.net', 'mail.ru', 'bk.ru', 'list.ru', 'internet.ru', 'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com'
  ];

  function isWorkEmail(email: string): boolean {
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1].toLowerCase();
    return !blockedDomains.includes(domain);
  }

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Get the current site URL for the redirect URL
  let redirectUrl = '';
  onMount(() => {
    if (browser) {
      // Create the redirect URL to the auth callback page
      const baseUrl = window.location.origin;
      redirectUrl = `${baseUrl}/auth/callback`;
    }
  });

  async function handleLogin() {
    error = '';
    success = '';
    if (!isValidEmail(email)) {
      error = 'Please enter a valid email address.';
      return;
    }
    if (!isWorkEmail(email)) {
      error = 'Please use your work email address.';
      return;
    }
    loading = true;
    try {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (supabaseError) {
        error = supabaseError.message;
      } else {
        success = 'Magic link sent! Check your email.';
        console.log('Mock magic link sent to:', email);
        
        // Dispatch success event with email for parent components
        dispatch('success', { email });
        
        email = '';
      }
    } catch (err: any) {
      error = 'Something went wrong. Please try again.';
      console.error('Login error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full {compact ? '' : 'max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-none'} flex flex-col gap-4">
  {#if !compact}
    <h2 class="text-3xl font-normal text-gray-900 mb-4">Create an account</h2>
  {/if}
  <form on:submit|preventDefault={handleLogin} class="flex flex-col gap-3">

    <label for="email" class="text-sm font-normal text-gray-700">Email address</label>
    <input
      type="email"
      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm placeholder:text-sm text-black placeholder:text-gray-400"
      placeholder="your@company.com"
      bind:value={email}
      autocomplete="email"
      required
      disabled={loading}
    />
    <div class="flex items-center mb-2 {compact ? 'my-2' : 'my-6'}">
      <input 
        type="checkbox" 
        id="terms" 
        bind:checked={termsAccepted}
        class="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded accent-teal-500"
      />
      <label for="terms" class="ml-2 block text-xs text-gray-600">
        I agree to the <a href="/terms" class="text-gray-900 underline">Terms of Service</a> and <a href="/privacy" class="text-gray-900 underline">Privacy Policy</a>
      </label>
    </div>
    
    <button
      type="submit"
      class="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed "
      disabled={loading || !email || !isValidEmail(email) || !isWorkEmail(email) || !termsAccepted}
    >
      {#if loading}
        <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
        Sending...
      {:else}
        Send magic link
      {/if}
    </button>
    {#if error}
      <div class="text-red-600 text-sm font-medium mt-1 text-center">{error}</div>
    {/if}
    {#if success}
      <div class="text-green-600 text-sm font-medium mt-1 text-center">{success}</div>
    {/if}
  </form>
  <div class="text-xs text-gray-800 mt-2 text-center">We only accept work email addresses.</div>
</div>
