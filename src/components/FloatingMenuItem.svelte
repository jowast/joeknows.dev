<svelte:options immutable="{true}" />

<script lang="ts">
import type { FloatingMenuContext } from "./FloatingMenu.svelte";
import { getContext, onDestroy, onMount } from "svelte";
import { FLOATING_MENU_KEY } from "./FloatingMenu.svelte";

export let icon: string;
export let label: string;

const { active, items, activate, deactivate } =
	getContext<FloatingMenuContext>(FLOATING_MENU_KEY);

$: isActive = $active === label;

onMount(() => items.add(label));
onDestroy(() => items.delete(label));

function onClick(event: MouseEvent) {
	event.stopPropagation();

	if (isActive) {
		deactivate(label);
	} else {
		activate(label);
	}
}
</script>

<div class="relative flex-reverse">
	<button
		class="w-12 h-12 p-2 bg-opacity-80 hover:opacity-100 transition-all duration-150"
		class:opacity-100="{isActive}"
		class:opacity-30="{!isActive}"
		class:bg-gray-800="{isActive}"
		class:bg-transparent="{!isActive}"
		on:click="{onClick}"
	>
		<img class="w-full h-full" src="{icon}" alt="{label}" />
	</button>
	<div
		class="absolute top-0 right-12 w-72 h-auto py-3 px-5 bg-gray-800 bg-opacity-80 shadow-md text-white text-sm font-light leading-tight transition-all duration-150"
		class:opacity-100="{isActive}"
		class:opacity-0="{!isActive}"
		class:visible="{isActive}"
		class:invisible="{!isActive}"
	>
		<slot />
	</div>
</div>
