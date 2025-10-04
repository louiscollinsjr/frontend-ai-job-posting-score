<script lang="ts">
  import { goto } from '$app/navigation';
  import { auditStore } from '$lib/stores/audit';
  import {
    auditJobUrl,
    auditJobText,
    auditJobFile,
    type AuditResult
  } from '$lib/api/audit';

  type ChatSender = 'system' | 'user';

  interface ChatMessage {
    text: string;
    sender: ChatSender;
    timestamp: Date;
    isError?: boolean;
  }

  const INITIAL_MESSAGE: ChatMessage = {
    text: 'Paste a job posting URL, description text, or upload a PDF/DOCX file to analyze',
    sender: 'system',
    timestamp: new Date()
  };

  // Chat messages array
  let messages: ChatMessage[] = [INITIAL_MESSAGE];

  // Form state
  let inputValue = '';
  let isLoading = false;
  let error: string | null = null;
  let file: File | null = null;

  const VALID_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ] as const;
  type ValidFileType = (typeof VALID_FILE_TYPES)[number];

  // Detect if input is URL
  function isUrl(text: string): boolean {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }

  function appendMessage(message: ChatMessage): void {
    messages = [...messages, message];
  }

  // Handle file upload
  function handleFileUpload(event: Event): void {
    const input = event.currentTarget as HTMLInputElement | null;
    const uploadedFile = input?.files?.[0] ?? null;
    if (!uploadedFile) return;

    if (!VALID_FILE_TYPES.includes(uploadedFile.type as ValidFileType)) {
      error = 'Please upload a PDF or DOCX file';
      appendMessage({
        text: error,
        sender: 'system',
        timestamp: new Date(),
        isError: true
      });
      return;
    }

    file = uploadedFile;
    appendMessage({
      text: `Uploaded file: ${uploadedFile.name}`,
      sender: 'user',
      timestamp: new Date()
    });
  }

  async function runAudit(): Promise<AuditResult> {
    if (file) {
      return auditJobFile(file);
    }
    if (isUrl(inputValue)) {
      return auditJobUrl(inputValue);
    }
    return auditJobText(inputValue);
  }

  // Submit analysis
  async function submitAnalysis(): Promise<void> {
    if (!inputValue && !file) return;

    isLoading = true;
    error = null;

    try {
      const results = await runAudit();

      // Update store and navigate
      auditStore.update((state) => ({
        ...state,
        results,
        isLoading: false,
        showResults: true,
        error: null
      }));

      goto('/results');
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      appendMessage({
        text: error,
        sender: 'system',
        isError: true,
        timestamp: new Date()
      });
    } finally {
      isLoading = false;
      inputValue = '';
      file = null;
    }
  }

  // Handle input submission
  function handleSubmit(): void {
    if (!inputValue.trim()) return;

    appendMessage({
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    });

    void submitAnalysis();
  }
</script>

<div class="chat-container bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg">
  <div class="messages-container h-96 overflow-y-auto mb-4 space-y-4">
    {#each messages as message}
      <div class={`message ${message.sender}-message ${message.isError ? 'error' : ''}`}>
        <div class="message-content">
          {message.text}
        </div>
        <div class="message-time text-xs opacity-70">
          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="input-area flex items-center gap-2">
    <input
      type="text"
      bind:value={inputValue}
      on:keydown={e => e.key === 'Enter' && handleSubmit()}
      placeholder="Paste URL or job description..."
      class="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
      disabled={isLoading}
    />
    
    <label class="file-upload-button bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full cursor-pointer transition-colors">
      <input 
        type="file" 
        accept=".pdf,.docx" 
        on:change={handleFileUpload}
        class="hidden"
        disabled={isLoading}
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    </label>
    
    <button 
      on:click={handleSubmit}
      disabled={isLoading || (!inputValue && !file)}
      class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
    >
      {#if isLoading}
        Analyzing...
      {:else}
        Analyze
      {/if}
    </button>
  </div>
</div>

<style>
  .chat-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 18px;
    position: relative;
  }
  
  .system-message {
    background: #f1f5f9;
    color: #334155;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  
  .user-message {
    background: #6366f1;
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }
  
  .error {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  .message-content {
    margin-bottom: 4px;
  }
  
  .message-time {
    text-align: right;
  }
  
  .file-upload-button:hover {
    transform: scale(1.05);
  }
</style>
