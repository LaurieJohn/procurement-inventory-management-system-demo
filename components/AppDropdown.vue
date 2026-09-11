<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * An Argon dropdown.
 *
 * Bootstrap 4's own dropdown plugin needs jQuery, which this build does not
 * load. The classes are the same — `.dropdown`, `.dropdown-menu`, `.show` — so
 * the menu looks and animates exactly as it did; only the open/close bookkeeping
 * is Vue's.
 */
withDefaults(
    defineProps<{
        /** Extra classes for the wrapper, e.g. `btn-group` or `mt-2`. */
        wrapperClass?: string
        /** Right-align the menu, as `.dropdown-menu-right` did. */
        alignRight?: boolean
    }>(),
    { wrapperClass: 'dropdown', alignRight: false },
)

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle(): void {
    open.value = !open.value
}

function close(): void {
    open.value = false
}

function onDocumentClick(event: MouseEvent): void {
    if (root.value && !root.value.contains(event.target as Node)) {
        close()
    }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
    <div ref="root" :class="wrapperClass">
        <slot name="trigger" :toggle="toggle" :open="open" />

        <div
            class="dropdown-menu"
            :class="{ show: open, 'dropdown-menu-right': alignRight }"
            @click="close"
        >
            <slot />
        </div>
    </div>
</template>

<style scoped>
/*
 * The menu is positioned against the trigger, so its shrink-to-fit width is
 * capped by however wide that trigger happens to be. The account trigger is
 * only the avatar once its name is hidden on a phone, which squeezed the menu
 * to about 50px and left its contents spilling off the screen. A floor fixes
 * the width; the ceiling keeps a right-aligned menu inside the viewport.
 */
.dropdown-menu {
    min-width: 13rem;
    max-width: calc(100vw - 1.5rem);
}
</style>
