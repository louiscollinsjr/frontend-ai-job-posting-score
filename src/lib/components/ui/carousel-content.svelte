<script lang="ts">
  export let class: string = ''
</script>

<div class={`relative overflow-hidden ${class}`}>
  <div class="flex">
    <slot />
  </div>
</div>
