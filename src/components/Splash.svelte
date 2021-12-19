<script lang="ts">
    import Loader from "./Loader.svelte";

    export let hidden: boolean;
    export let loaded: boolean;
</script>

<div
    class="fixed inset-0 z-30 flex flex-col text-white items-center justify-center transition-all duration-700 bg-gradient-to-t from-black to-splash p-6"
    class:visible="{!hidden}"
    class:invisible="{hidden}"
    class:opacity-100="{!hidden}"
    class:opacity-0="{hidden}"
>
    <h2 class="flex-none m-2 text-3xl md:text-4xl lg:text-5xl font-black tracking-wide shadow text-center">
        THE "HIRE ME" SIMULATOR
    </h2>
    <h6 class="flex-none m-2 mb-6 text-lg font-light tracking-widest text-center">
        A RESUME EXPERIENCE
    </h6>
    
    <div class="m-2 mb-8 flex-none">
        {#if loaded}
            <button
                class="bg-white bg-opacity-0 hover:bg-opacity-10 border py-2 px-8 rounded"
                on:click
            >
                CONTINUE
            </button>
        {:else}
            <Loader />
        {/if}
    </div>
</div>
