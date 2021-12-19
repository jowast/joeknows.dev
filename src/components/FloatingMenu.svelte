<script lang="ts" context="module">
    export const FLOATING_MENU_KEY = {};
</script>

<script lang="ts">
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import { writableSet } from "../stores";

    const items = writableSet<any>();

    let active: any = writable<any>(null);

    setContext(FLOATING_MENU_KEY, {
        active,
        items,
        activate,
        deactivate,
    });

    function activate(id: any) {
        $active = id;
    }

    function deactivate(id: any) {
        if ($active === id) {
            $active = null;
        }
    }
</script>

<div class="fixed z-20 right-3 top-3">
    <slot />
</div>
