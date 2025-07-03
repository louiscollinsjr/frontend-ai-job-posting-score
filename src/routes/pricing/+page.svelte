<script lang="ts">
  import { Card } from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { onMount } from 'svelte';
  // Simple icon for checkmark
  const Check = () => '<svg class="inline-block mr-2 h-4 w-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';

  // Plan data
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      users: 1,
      storage: 10,
      projects: 5,
      tagline: 'Essential features for individuals',
      features: ['Users', 'Storage', 'Projects'],
      selected: false
    },
    {
      id: 'business',
      name: 'Business',
      price: 79,
      users: 5,
      storage: 500,
      projects: 20,
      tagline: 'Advanced features for teams',
      features: ['Users', 'Storage', 'Projects'],
      selected: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      users: 20,
      storage: 2000,
      projects: 100,
      tagline: 'Complete solution for organizations',
      features: ['Users', 'Storage', 'Projects'],
      selected: false
    }
  ];

  let selectedPlan = plans[1];
  let additionalUsers = 0;
  let additionalStorage = 0;
  let premiumSupport = false;
  let customTraining = false;

  $: basePrice = selectedPlan.price;
  $: usersPrice = additionalUsers * 10;
  $: storagePrice = additionalStorage * 5;
  $: addonsPrice = (premiumSupport ? 49 : 0) + (customTraining ? 199 : 0);
  $: total = basePrice + usersPrice + storagePrice + addonsPrice;

  function selectPlan(plan) {
    selectedPlan = plan;
  }
</script>

<svelte:head>
  <title>Pricing - Job Post Visibility Score</title>
  <meta name="description" content="Choose the right plan for your job posting visibility needs" />
</svelte:head>

<style>
  /* Gradient text styling based on project memory */
  .gradient-text {
    background: linear-gradient(90deg, #4F46E5 0%, #EC4899 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
  
  /* Responsive grid for pricing cards */
 
  
  /* Customization section styles */
  .customization-section {
    margin-top: 3rem;
  }
  
  /* Add-ons section styles */
  .addons-section {
    margin-top: 2rem;
  }
  
  /* Summary card styles */
  .summary-card {
    margin-top: 3rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .pricing-grid {
      grid-template-columns: 1fr;
    }
    
    .customization-inputs {
      flex-direction: column;
    }
  }
</style>

<div class="container mx-auto px-4 py-20 max-w-7xl">
  <!-- Page Header -->
  <div class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
    <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
      Get actionable insights to improve your job post visibility. Start with our free plan,
      then upgrade anytime for detailed reports.
    </p>
  </div>

  <!-- Two-column layout -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
    <!-- Left Column: Steps -->
    <div class="space-y-8">
      <!-- Step 1: Choose Base Plan -->
      <div>
        <h2 class="text-lg font-semibold mb-4">1. Choose your base plan</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          {#each plans as plan}
            <Card
              class={`p-6 cursor-pointer transition-all ${selectedPlan.id === plan.id ? ' border-primary ring-2 ring-primary' : 'hover:shadow-md'}`}
              selected={selectedPlan.id === plan.id}
              on:click={() => selectPlan(plan)}
            >
              <div class="flex flex-col gap-2">
                <h3 class="text-lg font-bold pb-8">{plan.name}</h3>
                <div class="flex items-end gap-1">
                  <span class="text-2xl font-bold">${plan.price}</span>
                  <span class="text-muted-foreground text-xs">/mo</span>
                </div>
                <div class="text-xs text-muted-foreground mb-1">{plan.tagline}</div>
                <div class="flex flex-col gap-1 text-xs text-muted-foreground pt-2">
                  <div class="flex justify-between">
                    <span class="text-black">Users</span>
                    <span>{plan.users}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-black">Storage</span>
                    <span>{plan.storage}GB</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-black">Projects</span>
                    <span>{plan.projects}</span>
                  </div>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      </div>

      <!-- Step 2: Customize Your Plan -->
      <div class="">
        <h2 class="text-lg font-semibold mb-4">2. Customize your plan</h2>
        <Card class="p-6">
          <div class="flex flex-col gap-4">
            <div class="flex-1 flex items-center justify-between">
              <div class="flex flex-col gap-2">
                <div class="font-medium text-sm">Additional Users</div>
                <div class="text-xs text-muted-foreground">$10 per additional user per month</div>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="ghost" on:click={() => additionalUsers = Math.max(0, additionalUsers-1)}>-</Button>
                <span class="w-6 text-center">{additionalUsers}</span>
                <Button variant="ghost" on:click={() => additionalUsers++}>+</Button>
              </div>
            </div>
            <div class="flex-1 flex items-center justify-between">
              <div class="flex flex-col gap-2">
                <div class="font-medium text-sm">Additional Storage</div>
                <div class="text-xs text-muted-foreground">$5 per additional 10GB per month</div>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="ghost" on:click={() => additionalStorage = Math.max(0, additionalStorage-1)}>-</Button>
                <span class="w-6 text-center">{additionalStorage}</span>
                <Button variant="ghost" on:click={() => additionalStorage++}>+</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Step 3: Select Add-ons -->
      <div class="addons-section">
        <h2 class="text-lg font-semibold mb-4">3. Select add-ons</h2>
        <Card class="p-6 text-sm">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-2 cursor-pointer">
              <Checkbox class="mt-1" bind:checked={premiumSupport} />
              <div class="flex flex-col gap-1">
                <span class="font-medium">Premium Support - $49/month</span>
                <span class="text-xs text-muted-foreground">Get faster response times and dedicated support</span>
              </div>
            </label>
            <label class="flex items-start gap-2 cursor-pointer">
              <Checkbox class="mt-1" bind:checked={customTraining} />
              <div class="flex flex-col gap-1">
                <span class="font-medium">Custom Training - $199/month</span>
                <span class="text-xs text-muted-foreground">Personalized training sessions for your team</span>
              </div>
            </label>
          </div>
        </Card>
      </div>
    </div>

    <!-- Right Column: Custom Plan Summary -->
    <div>
      <div class="">
        <h2 class="text-lg font-semibold mb-4">Your Custom Plan</h2>
        <Card class="p-6 flex flex-col gap-2">
          <div class="flex justify-between items-center mb-2">
            <div class="font-semibold">{selectedPlan.name} Plan</div>
            <div class="font-bold text-lg">${basePrice}</div>
          </div>
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Additional Users</span>
            <span>${usersPrice}</span>
          </div>
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Additional Storage</span>
            <span>${storagePrice}</span>
          </div>
          {#if premiumSupport}
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Premium Support</span>
            <span>$49</span>
          </div>
          {/if}
          {#if customTraining}
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Custom Training</span>
            <span>$199</span>
          </div>
          {/if}
          <div class="border-t my-4"></div>
          <div class="flex justify-between items-center">
            <div class="font-semibold">Total</div>
            <div class="font-bold text-xl">${total}</div>
          </div>
          <div class="mt-4">
            <Button class="w-full">Get Started</Button>
          </div>
          <div class="mt-2 text-xs text-muted-foreground">
            Included Features:
            <ul class="list-disc pl-5">
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>API access (1,000 req/day)</li>
              <li>Team collaboration</li>
              <li>Custom domains</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  </div>

  <!-- Concierge Process Section -->
  <div class="bg-muted rounded-lg p-8 mb-16 max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-4 text-center">Your Personal Path to Pro</h2>
    <p class="text-center mb-6">
      When you request Pro access, our team will personally reach out within 24 hours with a secure payment link. 
      We'll handle your account upgrade and ensure you're set up for success with our premium features.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="text-center">
        <div class="bg-background rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
          <span class="font-bold">1</span>
        </div>
        <h3 class="font-medium mb-2">Request Access</h3>
        <p class="text-sm text-muted-foreground">Click the "Request Pro Access" button to start the process.</p>
      </div>
      <div class="text-center">
        <div class="bg-background rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
          <span class="font-bold">2</span>
        </div>
        <h3 class="font-medium mb-2">Personal Setup</h3>
        <p class="text-sm text-muted-foreground">Receive a secure payment link via email from our team.</p>
      </div>
      <div class="text-center">
        <div class="bg-background rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
          <span class="font-bold">3</span>
        </div>
        <h3 class="font-medium mb-2">Start Improving</h3>
        <p class="text-sm text-muted-foreground">Gain immediate access to Pro features after payment.</p>
      </div>
    </div>
  </div>

  <!-- FAQ Section -->
  <div class="max-w-3xl mx-auto mb-16">
    <h2 class="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
    <div class="space-y-6">
      <div class="border-b pb-4">
        <h3 class="text-lg font-medium mb-2">Why can't I see my full report on the Free plan?</h3>
        <p class="text-muted-foreground">
          The Free plan is designed to give you a taste of what our tool can do. You'll see your overall 
          Visibility Score™ so you know where your job post stands, but the detailed breakdown and actionable 
          suggestions are exclusive to our Pro plan. This helps you understand if there's room for improvement, 
          while the Pro plan shows you exactly how to make those improvements.
        </p>
      </div>
      <div class="border-b pb-4">
        <h3 class="text-lg font-medium mb-2">What happens after I request Pro access?</h3>
        <p class="text-muted-foreground">
          Within 24 hours, you'll receive an email from our team with a secure Stripe payment link. Once payment 
          is complete, we'll upgrade your account immediately and notify you when all Pro features are active. 
          This personal approach ensures you have direct access to our team from the start and allows us to 
          provide a more tailored experience.
        </p>
      </div>
      <div class="border-b pb-4">
        <h3 class="text-lg font-medium mb-2">Can I cancel my Pro plan at any time?</h3>
        <p class="text-muted-foreground">
          Yes, you can cancel your Pro subscription at any time with no hidden fees or long-term commitments. 
          Simply email our support team, and we'll process your cancellation. Your Pro access will continue 
          until the end of your current billing period.
        </p>
      </div>
      <div class="border-b pb-4">
        <h3 class="text-lg font-medium mb-2">What kind of suggestions will I get on the Pro plan?</h3>
        <p class="text-muted-foreground">
          The Pro plan provides specific, actionable suggestions tailored to your job posting. For example, our AI might suggest 
          rephrasing a vague job title like "Team Member" to "Senior Software Engineer - Python", adding specific skills that are 
          missing from your description, or restructuring your benefits section for greater clarity and appeal. These targeted 
          recommendations directly improve your Visibility Score™ and help your job posting reach more qualified candidates.
        </p>
      </div>
    </div>
  </div>

</div>
