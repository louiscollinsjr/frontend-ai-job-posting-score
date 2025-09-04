<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLThAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLThAttributes> = $props();

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

<th
	bind:this={ref}
	data-slot="table-head"
	class={cn(
		"text-foreground h-10 whitespace-nowrap bg-clip-padding px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</th>
