<script setup lang="ts">
import { watch } from 'vue'

/**
 * The dimmed layer behind the sidebar while it is covering the page.
 *
 * Below Argon's xl breakpoint an open sidebar sits on top of the content, so it
 * needs an obvious way out: tapping the backdrop closes it, and so does
 * following any link — otherwise it would stay spread over the page it just
 * navigated to.
 */
const route = useRoute()
const sidenav = useSidenav()

watch(
    () => route.fullPath,
    () => {
        if (!sidenav.isDesktop.value) {
            sidenav.close()
        }
    },
)
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
