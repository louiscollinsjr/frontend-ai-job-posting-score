<script>
  import { createEventDispatcher } from 'svelte';
  
  export let buttonText = "Subscribe";
  export let placeholder = "Enter your email";
  export let successMessage = "Thank you for subscribing!";
  
  let email = "";
  let isSubmitting = false;
  let isSuccess = false;
  let errorMessage = "";
  
  const dispatch = createEventDispatcher();
  
  async function handleSubmit() {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorMessage = "Please enter a valid email address";
      return;
    }
    
    errorMessage = "";
    isSubmitting = true;
    
    try {
      // Here you would typically send the email to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 500));
      
      isSuccess = true;
      dispatch('subscribe', { email });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        isSuccess = false;
        email = "";
      }, 3000);
    } catch (error) {
      errorMessage = "Something went wrong. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="email-subscribe-container">
  {#if isSuccess}
    <div class="success-message">
      {successMessage}
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="email-form">
      <input
        type="email"
        bind:value={email}
        placeholder={placeholder}
        class="email-input"
        disabled={isSubmitting}
      />
      <button 
        type="submit" 
        class="subscribe-button"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <span class="loading-spinner"></span>
        {:else}
          {buttonText}
        {/if}
      </button>
    </form>
    {#if errorMessage}
      <div class="error-message">{errorMessage}</div>
    {/if}
  {/if}
</div>

<style>
  .email-subscribe-container {
    width: 100%;
    max-width: 450px;
  }
  
  .email-form {
    display: flex;
    position: relative;
    border-radius: 9999px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .email-input {
    flex-grow: 1;
    padding: 0.75rem 1.25rem;
    border: 1px solid #e5e7eb;
    border-right: none;
    border-top-left-radius: 9999px;
    border-bottom-left-radius: 9999px;
    outline: none;
    font-size: 0.875rem;
    background-color: white;
  }
  
  .subscribe-button {
    padding: 0.75rem 1.5rem;
    background-color: #111827;
    color: white;
    border: none;
    border-top-right-radius: 9999px;
    border-bottom-right-radius: 9999px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }
  
  .subscribe-button:hover {
    background-color: #1f2937;
  }
  
  .subscribe-button:disabled {
    background-color: #6b7280;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    padding-left: 1.25rem;
  }
  
  .success-message {
    color: #10b981;
    font-size: 0.875rem;
    padding: 0.75rem 1.25rem;
    background-color: #f0fdf4;
    border: 1px solid #d1fae5;
    border-radius: 9999px;
    text-align: center;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
