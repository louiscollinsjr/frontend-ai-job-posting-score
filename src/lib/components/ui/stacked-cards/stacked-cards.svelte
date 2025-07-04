<script>
  export let width = "w-full";
  export let maxWidth = "max-w-md";
</script>

<!-- Stacked cards using only Tailwind CSS classes -->
<div class="{width} {maxWidth} mx-auto">
  <div class="flex flex-col items-center gap-3">
    <div class="relative flex flex-col mx-auto h-[100px] w-[400px]" style="mask-image: linear-gradient(to top, transparent 0%, black 35%); -webkit-mask-image: linear-gradient(to top, transparent 0%, black 35%);">
      <!-- Bottom card -->
      <div class="absolute w-[356px] h-[40px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 rounded-md bottom-0 left-1/2 -translate-x-1/2 -translate-y-[60%] scale-90"></div>
      
      <!-- Middle card -->
      <div class="absolute w-[356px] h-[40px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 rounded-md bottom-0 left-1/2 -translate-x-1/2 -translate-y-[30%] scale-95"></div>
      
      <!-- Top card (main card) -->
      <div class="absolute w-[356px] h-[40px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 rounded-md bottom-0 left-1/2 -translate-x-1/2">
        <slot></slot>
      </div>
    </div>
  </div>
</div>


