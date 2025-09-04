<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	// Allow consumers to use on:click, on:keydown, etc. on this component
	interface $$Events {
		click: MouseEvent;
		keydown: KeyboardEvent;
		keyup: KeyboardEvent;
		focus: FocusEvent;
		blur: FocusEvent;
		mouseenter: MouseEvent;
		mouseleave: MouseEvent;
	}

	let {
		ref = $bindable(null),
		class: className,
		onClick,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
		className
	)}
	{...restProps}
	on:click={onClick}
>
	{@render children?.()}
</div>
