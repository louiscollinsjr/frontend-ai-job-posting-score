<!-- src/lib/components/Card_EveryWordMatters.svelte -->
<script>
    import Logo from '$lib/components/Logo.svelte';
    import LayeredCard from '$lib/components/LayeredCard.svelte';
</script>

<style>
  @keyframes pulse-border {
    0%, 100% {
      border-color: rgba(209, 213, 219, 0.3);
      box-shadow: 0 0 0 0 rgba(1, 158, 223, 0.2);
    }
    50% {
      border-color: rgba(1, 158, 223, 0.5);
      box-shadow: 0 0 0 2px rgba(1, 158, 223, 0.1);
    }
  }
  
  .animate-pulse-border {
    animation: pulse-border 3s ease-in-out infinite;
  }
</style>

 <div class="w-full h-full rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-200/80 bg-gradient-to-br from-[#c3cde1] to-[#dde3ee]">
    <!-- Mock Browser Window -->
    <div class="flex h-full flex-col overflow-hidden rounded-xl bg-white/10">
      <!-- Main Content Area -->
      <div class="flex flex-grow flex-col justify-center bg-transparent p-0">
        <!-- Stacked Cards -->
        <LayeredCard 
          card1Margin="mt-0 ml-2 mr-6"
          card1Shadow="shadow-md"
          card1Padding="p-0"
          card2Margin="-mt-5 ml-10 mr-0"
          card2Shadow="shadow-xl"
          card2Padding="p-3"
        >
          <!-- Bottom Card: AI recommendation -->
          <div slot="card1" class="relative h-48 w-full">
            <img
              src="/rainbowkitten._Friendly_female_immigration_lawyer_speaking_with_c6ad1ee4-174d-423c-80a7-96cdca7a75b7.png"
              alt="Profile of AI Assistant"
              class="absolute inset-0 w-full h-full object-cover rounded-xl"  
            />
             <!-- class="absolute inset-0 w-full h-full object-cover object-top object-left rounded-xl"-->

           <div class="absolute bottom-5 left-12 right-0 text-xs">
              <div class="border border-gray-200/30 p-0.5 ml-4 mr-3 mb-1 rounded-xl animate-pulse-border">
                <p class="font-normal text-white text-xs bg-[#019edf]/80 p-2 rounded-lg">
                  <span class="text-white text-xs">Recommendation:</span> Emphasize your collaboration skills.
                </p>
              </div>
            </div> 
          </div>

          <!-- Top Card: Main testimonial content -->
          <div slot="card2" class="overflow-hidden">
            <div class="flex items-center gap-3 overflow-hidden">
            <img
              src="/jouman8691_19._White_Hairstyles_for_Women_Over_50_iphone_selfie_172ef2a4-7717-454c-a521-9ebe0de7ff74.png"
              alt="Profile of Sarah Chen"
              class="w-12 h-12 rounded-xl"
            />
            <div class="overflow-hidden">
              <h3 class="font-bold text-sm text-gray-800">Sarah Chen</h3>
              <p class="text-sm text-gray-500">Hiring Manager, Frock Inc.</p>
            </div>
            </div>
            <p class="mt-3 text-gray-700 text-xs overflow-hidden p-0">
              When your resume aligns with our core needs, it immediately stands out. We look for
              clear evidence of problem-solving and collaboration.  
            </p>
          </div>
        </LayeredCard>
      </div>
    </div>
  </div>
  
 