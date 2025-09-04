<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> = $props();

	// DOM event typings
	export interface $$Events {
		click: MouseEvent;
		keydown: KeyboardEvent;
		keyup: KeyboardEvent;
		focus: FocusEvent;
		blur: FocusEvent;
		mouseenter: MouseEvent;
		mouseleave: MouseEvent;
	}
</script>

<thead
	bind:this={ref}
	data-slot="table-header"
	class={cn("[&_tr]:border-b", className)}
	{...restProps}
>
	{@render children?.()}
</thead>
