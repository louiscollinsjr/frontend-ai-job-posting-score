<script lang="ts">
  export let class: string = ''
</script>

<div class={`min-w-0 shrink-0 grow-0 basis-full ${class}`}>
  <slot />
</div>
