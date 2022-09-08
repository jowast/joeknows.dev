<script lang="ts">
import Loader from "./Loader.svelte";

export let hidden: boolean;
export let loaded: boolean;
</script>

<div
	class="fixed inset-0 z-30 flex flex-col text-white items-center justify-center transition-all duration-700 bg-gradient-to-t from-shade-dark to-shade-light p-6"
	class:visible="{!hidden}"
	class:invisible="{hidden}"
	class:opacity-100="{!hidden}"
	class:opacity-0="{hidden}"
>
	<h2
		class="flex-none m-2 text-4xl md:text-5xl lg:text-6xl font-black tracking-wide text-center uppercase"
	>
		Joe Stanley
	</h2>
	<h6
		class="flex-none m-2 mb-6 text-xl md:text-2xl font-light tracking-widest text-center uppercase"
	>
		Software Developer
	</h6>

	<div class="m-2 mb-8 flex-none">
		{#if loaded}
			<button
				class="block bg-white bg-opacity-0 hover:bg-opacity-10 border py-2 px-8 m-3 rounded"
				on:click
			>
				View Resume
			</button>
      <a class="block m-3 hover:underline text-center" href="/doc/resume.pdf" download>
        or download as a PDF
      </a>
		{:else}
			<Loader />
		{/if}
	</div>
</div>
