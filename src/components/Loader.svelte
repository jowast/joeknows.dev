<script lang="ts">
    const SEGMENT_COUNT = 4;
    const SEGMENT_DELAY = 100;
    const SEGMENT_SPACING = 4;

    const segments = new Array(SEGMENT_COUNT);
    for (let i = 0; i < SEGMENT_COUNT; i++) {
        segments[i] = [
            'left-' + (i * SEGMENT_SPACING),
            'animation-delay-' + (i * SEGMENT_DELAY),
        ];
    }

    $: classLists = segments.map(segment => segment.join(' '));
</script>

<div class="relative block w-14 h-10 bg-transparent">
    {#each classLists as classList }
        <div class="absolute top-0 w-2 h-10 rounded bg-white animate-loader {classList}" />
    {/each}
</div>
