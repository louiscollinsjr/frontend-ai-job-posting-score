<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		value = $bindable(),
		...restProps
	}: AccordionPrimitive.RootProps = $props();

	// DOM event typings
	export interface $$Events {
		click: MouseEvent;
		keydown: KeyboardEvent;
		keyup: KeyboardEvent;
		focus: FocusEvent;
		blur: FocusEvent;
		mouseenter: MouseEvent;
		mouseleave: MouseEvent;
		change: Event;
	}
</script>

<AccordionPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="accordion"
	{...restProps}
/>
