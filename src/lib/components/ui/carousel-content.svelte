<script lang="ts">
  export let className: string = ''
</script>

<div class={`relative overflow-hidden ${className}`}>
  <div class="flex">
    <slot />
  </div>
</div>
