<script>
  // Import any necessary components
  import { page } from '$app/stores';

  // Track active tab
  let activeTab = 'terms';

  // Set default tab based on URL
  $: {
    if ($page.url.searchParams.get('tab') === 'privacy') {
      activeTab = 'privacy';
    } else {
      activeTab = 'terms';
    }
  }
</script>

<div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
  <h1 class="text-3xl font-bold mb-8">Legal</h1>
  
  <!-- Tab Navigation -->
  <div class="flex border-b border-gray-200 mb-8">
    <button
      class="px-4 py-2 font-medium text-sm focus:outline-none"
      class:border-b-2={activeTab === 'terms'}
      class:border-black={activeTab === 'terms'}
      class:text-black={activeTab === 'terms'}
      class:text-gray-500={activeTab !== 'terms'}
      on:click={() => activeTab = 'terms'}
    >
      Terms and Conditions
    </button>
    <button
      class="px-4 py-2 font-medium text-sm focus:outline-none"
      class:border-b-2={activeTab === 'privacy'}
      class:border-black={activeTab === 'privacy'}
      class:text-black={activeTab === 'privacy'}
      class:text-gray-500={activeTab !== 'privacy'}
      on:click={() => activeTab = 'privacy'}
    >
      Privacy Policy
    </button>
  </div>

  <!-- Tab Content -->
  <div class="prose max-w-none">
    {#if activeTab === 'terms'}
      <h2>Terms and Conditions</h2>
      <h3>Last Updated: July 29, 2025</h3>
      
      <h4>1. Acceptance of Terms</h4>
      <p>By accessing or using JobPostScore ("Service"), you agree to be bound by these Terms of Service. If you disagree, do not use our Service.</p>
      
      <h4>2. Description of Service</h4>
      <p>JobPostScore provides AI-powered job posting analysis tools to help improve job descriptions.</p>
      
      <h4>3. User Obligations</h4>
      <ul>
        <li>You must provide accurate information</li>
        <li>You may not use the Service for illegal purposes</li>
        <li>You are responsible for maintaining confidentiality of your account</li>
      </ul>
      
      <h4>4. Intellectual Property</h4>
      <p>All content and technology related to the Service are owned by JobPostScore.</p>
      
      <h4>5. Limitation of Liability</h4>
      <p>JobPostScore is not liable for any indirect, incidental or consequential damages arising from use of the Service.</p>
      
      <h4>6. Changes to Terms</h4>
      <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance.</p>
    {:else}
      <h2>Privacy Policy</h2>
      <h3>Last Updated: July 29, 2025</h3>
      
      <h4>1. Information We Collect</h4>
      <ul>
        <li>Account information (name, email)</li>
        <li>Job postings you submit for analysis</li>
        <li>Usage data and analytics</li>
      </ul>
      
      <h4>2. How We Use Information</h4>
      <ul>
        <li>To provide and improve our Service</li>
        <li>For customer support</li>
        <li>For research and development</li>
      </ul>
      
      <h4>3. Data Sharing</h4>
      <p>We do not sell your personal data. We may share information with:</p>
      <ul>
        <li>Service providers who assist our operations</li>
        <li>When required by law</li>
      </ul>
      
      <h4>4. Data Security</h4>
      <p>We implement industry-standard security measures to protect your data.</p>
      
      <h4>5. Your Rights</h4>
      <p>You may:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Request correction or deletion</li>
        <li>Opt-out of marketing communications</li>
      </ul>
      
      <h4>6. Changes to Policy</h4>
      <p>We will notify users of material changes to this policy.</p>
    {/if}
  </div>
</div>
