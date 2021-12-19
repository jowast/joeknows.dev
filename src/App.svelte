<script lang="ts">
    import { FloatingMenu, FloatingMenuItem } from "./components/floating-menu";
    import Splash from "./components/Splash.svelte";
    import Scene from './components/Scene.svelte';

    let continued: boolean = false;
    let loaded: boolean = false;

    const controls = [
        {
            icon: '/img/movement.svg',
            label: 'Look around',
            text: 'Move mouse, or device, to look around room',
        },
        {
            icon: '/img/drag--vertical.svg',
            label: 'Toggle resume',
            text: 'Click screen to toggle resume position',
        },
        {
            icon: '/img/zoom--fit.svg',
            label: 'Zoom in and out',
            text: 'Zoom using the mouse wheel, or by pinching the screen',
        },
    ];

    function onContinue(event: MouseEvent) {
        event.stopPropagation();
        continued = true;
    }

    function onLoad() {
        loaded = true;
    }
</script>

<Splash
    hidden="{continued}"
    loaded="{loaded}"
    on:click="{onContinue}"
/>

<Scene
    animate="{continued}"
    on:load="{onLoad}"
/>

{#if continued}
    <FloatingMenu>
        <FloatingMenuItem
            icon="/img/controls.png"
            label="Controls"
        >
            <ul>
                {#each controls as { icon, label, text }}
                    <li class="flex items-center py-2">
                        <img class="w-4 h-4 mr-3" src="{icon}" alt="{label}" />
                        <span>{text}</span>
                    </li>
                {/each}
            </ul>
        </FloatingMenuItem>
        <FloatingMenuItem
            icon="/img/information.png"
            label="Information"
        >
            <p>
                Welcome to <span class="font-medium">The "Hire Me" Simulator</span>, where you can
                review my resume in 3D! Step into the virtual world and instantly become a hiring
                manager, seated in an office, with my resume in hand.
                <br />
                <br />
                Your task: <span class="font-medium">review my resume.</span> Do you have what it takes?
                <br />
                <br />
                Feel free to bring my resume to life by downloading and printing
                <a class="underline hover:text-indigo-400" href="/doc/resume.pdf" download>this document</a>.
            </p>
        </FloatingMenuItem>
    </FloatingMenu>
{/if}
