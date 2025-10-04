<script lang="ts">
  export let className: string = ''
</script>

<div class={`min-w-0 shrink-0 grow-0 basis-full ${className}`}>
  <slot />
</div>
