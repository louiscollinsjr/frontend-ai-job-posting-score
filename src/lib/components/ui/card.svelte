<script lang="ts">
  export let className = "";
  export let selected = false;
</script>
<div class={`rounded-xl border bg-card p-8 shadow-sm transition-all ${selected ? 'ring-2 ring-primary' : ''} ${className}`}>
  <slot />
</div>
