<script setup lang="ts">
/**
 * The dimmed layer behind the sidebar while it is covering the page.
 *
 * Below Argon's xl breakpoint an open sidebar sits on top of the content, so it
 * needs an obvious way out: tapping the backdrop closes it. Following a link
 * closes it too, but that is the router's business rather than this layer's —
 * see useSidenav.
 */
const sidenav = useSidenav()
</script>

<template>
    <Transition name="backdrop">
        <div
            v-if="sidenav.isOverlay.value"
            class="sidenav-backdrop"
            aria-hidden="true"
            @click="sidenav.close()"
        ></div>
    </Transition>
</template>
