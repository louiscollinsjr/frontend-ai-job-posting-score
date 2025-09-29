<script lang="ts">
  export interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  export let items: BreadcrumbItem[] = [];
  export let ariaLabel = 'Breadcrumb';
</script>

{#if items.length}
  <nav aria-label={ariaLabel} class="mb-2 mt-4 lg:mb-12 lg:mt-12">
    <ol class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
      {#each items as item, index}
        <li class="flex items-center gap-2">
          {#if item.href && index !== items.length - 1}
            <a
              href={item.href}
              class="rounded-full px-3 py-1 text-gray-700 transition hover:text-gray-900"
            >
              {item.label}
            </a>
          {:else}
            <span class={`rounded-full px-3 py-1 font-medium ${index === items.length - 1 ? 'text-gray-900' : 'text-gray-700'}`}>
              {item.label}
            </span>
          {/if}

          {#if index < items.length - 1}
            <span class="text-gray-300">/</span>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}
