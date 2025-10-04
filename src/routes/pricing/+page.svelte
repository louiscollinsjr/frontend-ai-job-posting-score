<script lang="ts">
  import { Card } from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { onMount } from 'svelte';
  import * as Accordion from '$lib/components/ui/accordion/index.js';
	import BetaBadge from '$lib/components/BetaBadge.svelte'; 
  // Simple icon for checkmark
  const Check = () => '<svg class="inline-block mr-2 h-4 w-4 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';

  // Plan data
  let plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 0, annual: 279 },
      users: 1,
      storage: 1,
      projects: "7-days",
      tagline: 'Essential features for individuals',
      features: ['Users', 'Storage', 'Projects'],
      includedFeatures: [
    '5 Audit Scores per month',
    'Overall Visibility Score™',
    'No credit card required'
  ]
    },
    {
      id: 'business',
      name: 'Business',
      price: { monthly: 79, annual: 759 },
      users: 1,
      storage: 10,
      projects: "6 months",
      tagline: 'Advanced features for teams',
      features: ['Users', 'Storage', 'Projects'],
      includedFeatures: [
    '50 Audits per month',
    'Overall Visibility Score™',
    'Detailed Category Score Breakdown',
    'Actionable AI-Powered Suggestions',
    'Save & Track Report History',
    'Export Reports (PDF & CSV)'
  ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 199, annual: 1911 },
      users: 20,
      storage: 2000,
      projects: "Full",
      tagline: 'Complete solution for organizations',
      features: ['Users', 'Storage', 'Projects'],
      includedFeatures: [
    'Unlimited Audit Scores per month',
    'Multi-User & Team Collaboration',
    'Priority Onboarding & Support',
    'Shared Report Workspace (coming soon)',
    'Grade your ATS Feed (coming soon)', 
    'Custom Integrations (coming soon)'
  ]
    }
  ];

  let selectedPlanId = 'business';
  let additionalUsers = 0;
  let additionalStorage = 0;
  let premiumSupport = false;
  let customTraining = false;

  let billingCycle: 'monthly' | 'annual' = 'monthly';

  $: selectedPlan = plans.find(p => p.id === selectedPlanId);
  $: basePrice = selectedPlan?.price[billingCycle] ?? 0;
  $: usersPrice = additionalUsers * 10;
  $: storagePrice = additionalStorage * 5;
  $: premiumSupportPrice = premiumSupport ? 49 : 0;
  $: customTrainingPrice = customTraining ? 199 : 0;
  $: total = basePrice + (usersPrice + storagePrice + premiumSupportPrice + customTrainingPrice) * (billingCycle === 'monthly' ? 1 : 12);

  function selectPlan(plan: { id: string }) {
    selectedPlanId = plan.id;
  }
  
  // Tally embed configuration (replace with your real Tally form ID)
  const TALLY_FORM_ID = '3jVVYx';
  const TALLY_FORM_URL = `https://tally.so/r/${TALLY_FORM_ID}`;

  // Load Tally embed script on client if not already present
  onMount(() => {
    if (typeof window === 'undefined') return;
    const src = 'https://tally.so/widgets/embed.js';
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      document.head.appendChild(s);
    }
  });
</script>

<svelte:head>
  <title>Pricing - Job Post Visibility Score</title>
  <meta name="description" content="Choose the right plan for your job posting visibility needs" />
</svelte:head>

<style>
  /* Responsive grid for pricing cards */
 
  
  /* Add-ons section styles */
  .addons-section {
    margin-top: 2rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
  }
</style>

<div class="container mx-auto px-4 py-20 max-w-7xl pt-32">
  <!-- Page Header -->
  <div class="text-center mb-12">
    <h1 class="text-4xl md:text-5xl font-bold mb-4">Build Your Perfect Plan</h1>
    <p class="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
      Get actionable insights to improve your job post visibility. Start with our free plan,
      or choose a plan that fits your needs.
    </p>
    <div class="mt-8 flex justify-center">
      <div class="bg-gray-200 p-1 rounded-full flex items-center gap-1">
        <Button class="rounded-full" variant={billingCycle === 'monthly' ? 'default' : 'ghost'} on:click={() => billingCycle = 'monthly'}>Monthly</Button>
        <Button class="rounded-full" variant={billingCycle === 'annual' ? 'default' : 'ghost'} on:click={() => billingCycle = 'annual'}>Annually (Save 20%)</Button>
      </div>
    </div>
    <section class="flex flex-col justify-center items-center py-16 gap-8">
      <!--Request access link-->
      <a
        href={TALLY_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Request Early Access (opens in a new tab)"
        class="rounded-full max-w-xs bg-blue-600 text-white px-4 py-2 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
      >
        Request Early Access
      </a>
      <BetaBadge />
    </section>
  </div>

  

  <!-- Two-column layout -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
    <!-- Left Column: Steps -->
    <div class="space-y-8">


      <!-- Step 1: Choose Base Plan -->
      <div>
        <h2 class="text-lg font-semibold mb-4">1. Choose your base plan</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          {#each plans as plan (plan.id)}
            <Card
              id={`plan-${plan.id}`}
              class={`p-6 px-4 cursor-pointer transition-all ${selectedPlanId === plan.id ? ' border-primary ring-2 ring-primary bg-primary/5 shadow-lg' : ' hover:shadow-md'}`}
              on:click={() => selectPlan(plan)}
            >
              <div class="flex flex-col gap-2">
                <h3 class="text-lg font-bold pb-8">{plan.name}</h3>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-bold">${plan.price[billingCycle]}</span>
                  <span class="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
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
                    <span class="text-black">History</span>
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
                <Button variant="ghost" on:click={() => additionalUsers = Math.max(0, additionalUsers-1)} disabled={additionalUsers === 0}>-</Button>
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
                <Button variant="ghost" on:click={() => additionalStorage = Math.max(0, additionalStorage-1)} disabled={additionalStorage === 0}>-</Button>
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
            <label for="premium-support" class="flex items-start gap-2 cursor-pointer">
              <Checkbox id="premium-support" class="mt-1" bind:checked={premiumSupport} />
              <div class="flex flex-col gap-1">
                <span class="font-medium">Premium Support - $49/month</span>
                <span class="text-xs text-muted-foreground">Get faster response times and dedicated support</span>
              </div>
            </label>
            <label for="custom-training" class="flex items-start gap-2 cursor-pointer">
              <Checkbox id="custom-training" class="mt-1" bind:checked={customTraining} />
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
            <div class="font-semibold">{selectedPlan?.name || 'Plan'} ({billingCycle === 'monthly' ? 'Monthly' : 'Annual'})</div>
            <div class="font-bold text-lg">${basePrice}</div>
          </div>
          {#if additionalUsers > 0}
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Additional Users ({additionalUsers})</span>
            <span>${usersPrice * (billingCycle === 'monthly' ? 1 : 12)}</span>
          </div>
          {/if}
          {#if additionalStorage > 0}
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Additional Storage ({additionalStorage} GB)</span>
            <span>${storagePrice * (billingCycle === 'monthly' ? 1 : 12)}</span>
          </div>
          {/if}
          {#if premiumSupport}
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Premium Support</span>
            <span>${premiumSupportPrice * (billingCycle === 'monthly' ? 1 : 12)}</span>
          </div>
          {/if}
          {#if customTraining}
          <div class="flex justify-between text-sm text-muted-foreground">
            <span>Custom Training</span>
            <span>${customTrainingPrice * (billingCycle === 'monthly' ? 1 : 12)}</span>
          </div>
          {/if}
          <div class="border-t my-4"></div>
          <div class="flex justify-between items-center">
            <div class="font-semibold">Total</div>
            <div class="font-bold text-xl">${total}</div>
          </div>
          <div class="mt-4">
            <Button
              class="w-full rounded-full"
              data-tally-open={TALLY_FORM_ID}
              data-tally-width="380"
              data-tally-overlay="1"
              data-tally-emoji-text="👋"
              data-tally-emoji-animation="wave"
              data-tally-auto-close="2000"
              data-tally-darkmode="auto"
            >
              Request Early Access
            </Button>
          </div>
          <div class="mt-2 text-xs text-muted-foreground text-center">
            Having trouble with the popup? <a href={TALLY_FORM_URL} target="_blank" rel="noopener noreferrer" class="underline">Open the request form</a>.
          </div>
          <div class="mt-2 text-xs text-muted-foreground">
            Included Features:
            <ul class="list-disc pl-5">
              {#each selectedPlan?.includedFeatures || [] as feature}
                <li>{feature}</li>
              {/each}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  </div>

  <!-- Concierge Process Section -->
  <div class="bg-muted rounded-lg p-8 mb-32 max-w-3xl mx-auto">
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
    <Accordion.Root class="w-full" type="multiple">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Why can't I see my full report on the Free plan?</Accordion.Trigger>
        <Accordion.Content>
          The Free plan is designed to give you a taste of what our tool can do. You'll see your overall 
          Visibility Score™ so you know where your job post stands, but the detailed breakdown and actionable 
          suggestions are exclusive to our Pro plan. This helps you understand if there's room for improvement, 
          while the Pro plan shows you exactly how to make those improvements.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>What happens after I request Pro access?</Accordion.Trigger>
        <Accordion.Content>
          Within 24 hours, you'll receive an email from our team with a secure Stripe payment link. Once payment 
          is complete, we'll upgrade your account immediately and notify you when all Pro features are active. 
          This personal approach ensures you have direct access to our team from the start and allows us to 
          provide a more tailored experience.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Can I cancel my Pro plan at any time?</Accordion.Trigger>
        <Accordion.Content>
          Yes, you can cancel your Pro subscription at any time with no hidden fees or long-term commitments. 
          Simply email our support team, and we'll process your cancellation. Your Pro access will continue 
          until the end of your current billing period.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-4">
        <Accordion.Trigger>What kind of suggestions will I get on the Pro plan?</Accordion.Trigger>
        <Accordion.Content>
          The Pro plan provides specific, actionable suggestions tailored to your job posting. For example, our AI might suggest 
          rephrasing a vague job title like "Team Member" to "Senior Software Engineer - Python", adding specific skills that are 
          missing from your description, or restructuring your benefits section for greater clarity and appeal. These targeted 
          recommendations directly improve your Visibility Score™ and help your job posting reach more qualified candidates.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  </div>

</div>
