<script>
	// Card 1 (bottom/back card) props
	export let card1Margin = 'mt-8 ml-4 mr-8';
	export let card1Shadow = 'shadow-lg';
	export let card1Padding = 'p-6';
	export let card1Background = 'bg-white';
	export let card1Rounded = 'rounded-xl';

	// Card 2 (top/front card) props  
	export let card2Margin = '-mt-4 ml-8 mr-4';
	export let card2Shadow = 'shadow-xl';
	export let card2Padding = 'p-6';
	export let card2Background = 'bg-white';
	export let card2Rounded = 'rounded-xl';
</script>

<div class="relative w-full">
	<!-- Bottom/Back Card -->
	<div class="relative overflow-hidden {card1Background} {card1Rounded} {card1Margin} {card1Shadow} {card1Padding} z-10">
		<slot name="card1" />
	</div>

	<!-- Top/Front Card -->
	<div class="relative overflow-hidden {card2Background} {card2Rounded} {card2Margin} {card2Shadow} {card2Padding} z-20">
		<slot name="card2" />
	</div>
</div>