<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();

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

<caption
	bind:this={ref}
	data-slot="table-caption"
	class={cn("text-muted-foreground mt-4 text-sm", className)}
	{...restProps}
>
	{@render children?.()}
</caption>
