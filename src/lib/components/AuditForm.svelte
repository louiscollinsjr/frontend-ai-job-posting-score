<script
  lang="ts">
import { z } from 'zod';
import { fade, fly } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

// Zod schema for URLs starting with https:// or http://
const urlSchema = z.string()
  .url({ message: 'Please enter a valid URL (must include http:// or https://)' })
  .refine(
    (val) => val.startsWith('https://') || val.startsWith('http://'),
    { message: 'URL must start with https:// or http://' }
  );

import { createEventDispatcher } from 'svelte';
import { auditJobUrl, auditJobText } from '$lib/api/audit.js';
import { goto } from '$app/navigation';
import { auditStore } from '$lib/stores/audit.js';
import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";
import * as Alert from "$lib/components/ui/alert/index.js";
  
  // Create a dispatcher to send events to parent components
  const dispatch = createEventDispatcher();
  
  // Form state variables
  let inputType = 'url'; // Default to URL input
  let jobUrl = '';
  let jobDescription = '';
  let selectedFile = null;
  let isLoading = false;
  let isUrlValid = true;
  let error = '';
  let urlInputEl: HTMLInputElement | null = null;
  
  // Form validation state
  let isDescriptionValid = true;
  
  // Toggle between URL and text/file input
  function setInputType(type) {
    inputType = type;
    error = ''; // Clear any errors when switching
  }
  
  // Validate URL format
  function validateUrl(url) {
    // Basic URL validation
    const pattern = /^(https?:\/\/)?(([\da-z.-]+)\.([a-z.]{2,6})|(([\d.]+)|(\[[a-f0-9:]+\])))(:[0-9]+)?([/\w .-]*)*\/?$/;
    return pattern.test(url);
  }
  
  // Validate text input
  function validateDescription(text) {
    return text.trim().length > 50; // Minimum 50 characters
  }
  
  // Handle file upload
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
      try {
        const text = await file.text();
        jobDescription = text;
        // On mobile, immediately switch to text mode so the user can submit
        inputType = 'text';
      } catch (e) {
        console.error('Error reading file:', e);
        error = 'Could not read the uploaded file. Please try again.';
      }
    }
  }
  
  // Handle form submission
  async function handleSubmit() {
    error = '';
    
    // Validate based on input type
    if (inputType === 'url') {
      isUrlValid = validateUrl(jobUrl);
      if (!isUrlValid || !jobUrl) {
        error = 'Please enter a valid job posting URL';
        return;
      }
    } else {
      isDescriptionValid = validateDescription(jobDescription);
      if (!isDescriptionValid) {
        error = 'Please enter a job description (minimum 50 characters)';
        return;
      }
    }
    
    // Set loading state
    isLoading = true;
    
    // Send data to API
    try {
      let results;
      
      if (inputType === 'url') {
        results = await auditJobUrl(jobUrl);
      } else {
        results = await auditJobText(jobDescription);
      }
      
      // Send event to parent with form data and results
      dispatch('audit', {
        type: inputType,
        data: inputType === 'url' ? jobUrl : jobDescription,
        results
      });
      
      // Store results in auditStore
      auditStore.update(state => ({
        ...state,
        results,
        isLoading: false,
        showResults: true,
        error: null
      }));
      
      // Navigate to results page
      goto('/results');
      
    } catch (e) {
      error = 'An error occurred while analyzing the job posting. Please try again.';
      console.error('Audit submission error:', e);
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="audit-form-container rounded-xl p-2 mb-0 md:p-8 mx-auto font-aeonik">
  <div class="mb-8">
    <!-- Modern Switch-Style Toggle -->
    <div class="mb-6">
      <!-- Mobile: simple action row (hidden per new UX) -->
      <div class="hidden">
        <div class="grid grid-cols-2 gap-2 max-w-md mx-auto">
          <button
            type="button"
            class="h-10 rounded-full bg-black text-white text-sm font-aeonik"
            on:click={() => { setInputType('url'); setTimeout(() => urlInputEl?.focus(), 0); }}
          >
            Paste URL
          </button>
          <label
            for="mobile-file-upload"
            class="h-10 rounded-full bg-gray-200 text-gray-900 text-sm font-aeonik flex items-center justify-center cursor-pointer"
          >
            Upload File
          </label>
          <input
            id="mobile-file-upload"
            type="file"
            class="hidden"
            accept=".txt,.pdf,.docx,.doc,.rtf,.md,.html,.htm"
            on:change={handleFileUpload}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <!-- Desktop / tablet: keep the large segmented switch -->
      <div class="w-full mx-auto relative mb-6 sm:mb-12 hidden sm:block">
        <!-- Custom Switch Toggle -->
        <div class="flex items-center justify-center p-2 bg-gray-200 rounded-full shadow-inners h-12 sm:h-16 max-w-md mx-auto">
          <div class="relative w-full flex justify-between items-center">
            <!-- Track and Thumb -->
            <div class="absolute h-10 sm:h-12 w-1/2 rounded-full bg-black transition-transform duration-300 ease-in-out" 
              style="transform: translateX({inputType === 'url' ? '0%' : '100%'});"></div>
            
            <!-- Buttons -->
            <button 
              type="button"
              class="flex-1 relative z-10 flex items-center justify-center h-10 sm:h-12 text-base font-aeonik font-normal transition-colors duration-300 {inputType === 'url' ? 'text-white' : 'text-gray-800'}"
              on:click={() => setInputType('url')}
              aria-pressed={inputType === 'url'}
            >
              Paste URL
            </button>
            
            <button 
              type="button"
              class="flex-1 relative z-10 flex sm:flex-col items-center justify-center h-10 sm:h-12 text-base sm:w-[100%] font-aeonik font-normal transition-colors duration-300 {inputType === 'text' ? 'text-white' : 'text-gray-800'}"
              on:click={() => setInputType('text')}
              aria-pressed={inputType === 'text'}
            >
            Upload File
            </button>
          </div>
        </div>
      </div>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6 sm:space-y-12">
      <!-- Mobile-only simplified inputs: URL field + file upload -->
      <div class="sm:hidden space-y-4">
        <div class="form-control">
          <label for="job-url" class="block text-sm sm:text-xl font-medium text-gray-700 mb-2 text-center">
            Paste Job Posting URL to Get Your Score
          </label>
          <input
            type="text"
            id="job-url-mobile"
            placeholder="https://example.com/job-posting"
            class="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all {!isUrlValid ? 'border-red-500' : ''}"
            bind:value={jobUrl}
            bind:this={urlInputEl}
            disabled={isLoading}
            on:input={() => { isUrlValid = validateUrl(jobUrl); error = ''; }}
          />
        </div>
        <!-- File Upload Option (mobile) -->
        <div class="form-control">
          <div class="mt-2">
            <label for="file-upload-mobile" class="flex items-center justify-center w-full px-4 py-3 border border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
              <svg class="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-sm font-medium text-gray-700">
                {selectedFile ? selectedFile.name : 'Upload a file'}
              </span>
            </label>
            <input 
              id="file-upload-mobile" 
              type="file" 
              class="hidden" 
              accept=".txt,.pdf,.docx,.doc,.rtf,.md,.html,.htm" 
              on:change={handleFileUpload}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <!-- Mobile submit button -->
      <div class="sm:hidden form-submit mt-8 sticky bottom-4 relative max-w-md mx-auto" style="padding-bottom: env(safe-area-inset-bottom)">
        <div class="absolute -inset-0.5 w-[calc(100%+8px)] mx-auto bg-gradient-to-r from-[#ff00f7]/70 via-[#fa3d1d] to-[#0358f7]/70 rounded-full blur opacity-50 animate-pulse"></div>
        <button
          type="submit"
          class="relative mx-auto cta-button w-[calc(100%-4px)] text-lg text-center flex items-center justify-center gap-2 bg-black hover:bg-gray-700 transition-colors duration-300 text-white py-2 px-8 rounded-full font-aeonik tracking-wider font-normal"
          disabled={isLoading}
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          {:else}
            Get JobPostScore
          {/if}
        </button>
      </div>
      {#key inputType}
      <div class="hidden sm:block" in:fade="{{ duration: 300, delay: 200 }}" out:fade="{{ duration: 200 }}">
        {#if inputType === 'url'}
        <div class="form-control">
          <label for="job-url" class="block text-base sm:text-xl font-medium text-gray-700 mb-2">Paste Job Posting URL to Get Your Score</label>
          <input
            type="text"
            id="job-url"
            placeholder="https://example.com/job-posting"
            class="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all {!isUrlValid ? 'border-red-500' : ''}"
            bind:value={jobUrl}
            bind:this={urlInputEl}
            disabled={isLoading}
            on:input={() => { isUrlValid = validateUrl(jobUrl); error = ''; }}
          />
          {#if !isUrlValid && error}
  <Alert.Root variant="destructive" class="mt-6 text-xs bg-transparent border-none">
    <CircleAlertIcon class="size-4" />
    <Alert.Title>Error</Alert.Title>
    <Alert.Description>{error}</Alert.Description>
  </Alert.Root>
{/if}
        </div>
        {:else}        
        <div class="form-control">
          <label for="job-description" class="block text-base sm:text-xl font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            id="job-description"
            placeholder="Paste your job description here..."
            class="w-full px-4 py-3 border bg-[#f8f8f8] border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all min-h-[200px] {!isDescriptionValid ? 'border-red-500' : ''}"
            bind:value={jobDescription}
            disabled={isLoading}
          ></textarea>
          
          <!-- File Upload Option -->
          <div class="mt-4">
            <label for="file-upload" class="flex items-center justify-center w-full px-4 py-3 border border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
              <svg class="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-sm font-medium text-gray-700">
                {selectedFile ? selectedFile.name : 'Upload a file or paste text above'}
              </span>
            </label>
            <input 
              id="file-upload" 
              type="file" 
              class="hidden" 
              accept=".txt,.pdf,.docx,.doc,.rtf,.md,.html,.htm" 
              on:change={handleFileUpload}
              disabled={isLoading}
            />
          </div>
          
          {#if !isDescriptionValid && error}
            <p class="mt-1 text-sm text-red-600">{error}</p>
          {/if}
        </div>
        {/if}
        
        <div class="form-submit mt-8 sm:mt-24 sticky bottom-4 relative max-w-md mx-auto" style="padding-bottom: env(safe-area-inset-bottom)">
          <div class="absolute -inset-0.5 w-[calc(100%+8px)] mx-auto bg-gradient-to-r from-[#ff00f7]/70 via-[#fa3d1d] to-[#0358f7]/70 rounded-full blur opacity-50 animate-pulse"></div>
          <button
            type="submit"
            class="relative mx-auto cta-button w-[calc(100%-4px)] text-lg sm:text-2xl text-center flex items-center justify-center gap-2 bg-black hover:bg-gray-700 transition-colors duration-300 text-white py-2 px-8 rounded-full font-aeonik tracking-wider font-normal"
            disabled={isLoading}
          >
            {#if isLoading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            {:else}
           <span class="block sm:hidden">Get JobPostScore</span>
           <span class="hidden sm:block">Get Your Free JobPostScore</span>
           <!-- <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" class=" hidden sm:block ml-1">
            <path fill="currentColor" d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path>
          </svg> -->
            {/if}
          </button>
        </div>
      </div>
      {/key}
      
      {#if error && isUrlValid && isDescriptionValid}
        <div class="error-message p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      {/if}
    </form>
  </div>
</section>

<style>
  .cta-button {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
</style>