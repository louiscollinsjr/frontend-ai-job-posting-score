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

<section class="audit-form-container rounded-full p-6 md:p-8 max-w-3xl mx-auto ">
  <div class="mb-8">
    <!-- Modern Switch-Style Toggle -->
    <div class="mb-6">
      <div class="w-full max-w-sm mx-auto relative mb-16">
        <!-- Custom Switch Toggle -->
        <div class="flex items-center justify-center p-2 bg-gray-100 rounded-full shadow-inner h-16">
          <div class="relative w-full flex justify-between items-center">
            <!-- Track and Thumb -->
            <div class="absolute h-12 w-1/2 rounded-full bg-black transition-transform duration-300 ease-in-out" 
              style="transform: translateX({inputType === 'url' ? '0%' : '100%'});"></div>
            
            <!-- Buttons -->
            <button 
              type="button"
              class="flex-1 relative z-10 flex items-center justify-center h-12 text-xs font-normal transition-colors duration-300 {inputType === 'url' ? 'text-white' : 'text-gray-800'}"
              on:click={() => setInputType('url')}
              aria-pressed={inputType === 'url'}
            >
              <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Paste URL
            </button>
            
            <button 
              type="button"
              class="flex-1 relative z-10 flex items-center justify-center h-12 text-xs font-normal transition-colors duration-300 {inputType === 'text' ? 'text-white' : 'text-gray-800'}"
              on:click={() => setInputType('text')}
              aria-pressed={inputType === 'text'}
            >
              <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Paste or Upload File
            </button>
          </div>
        </div>
      </div>
    </div>

    <form on:submit|preventDefault={() => { validateUrl(); if (isUrlValid) handleSubmit(); }} class="space-y-12">
      {#key inputType}
      <div in:fade="{{ duration: 300, delay: 200 }}" out:fade="{{ duration: 200 }}">
        {#if inputType === 'url'}
        <div class="form-control">
          <label for="job-url" class="block text-sm font-medium text-gray-700 mb-1">Job Posting URL</label>
          <input
            type="text"
            id="job-url"
            placeholder="https://example.com/job-posting"
            class="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all {!isUrlValid ? 'border-red-500' : ''}"
            bind:value={jobUrl}
            disabled={isLoading}
            on:input={validateUrl}
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
          <label for="job-description" class="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            id="job-description"
            placeholder="Paste your job description here..."
            class="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all min-h-[200px] {!isDescriptionValid ? 'border-red-500' : ''}"
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
        
        <div class="form-submit mt-12">
          <button
            type="submit"
            class="w-full max-w-xs mx-auto py-3 px-6 text-white bg-black hover:bg-black rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex justify-center items-center text-sm"
            disabled={isLoading}
          >
            {#if isLoading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            {:else}
           Get Your Free ReachScore
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