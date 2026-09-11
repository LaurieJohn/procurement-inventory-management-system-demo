<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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

/** The scrolling table this dropdown sits in, if it sits in one at all. */
function scroller(): HTMLElement | null {
    return root.value?.closest<HTMLElement>('.table-responsive') ?? null
}

/**
 * Make room in a scrolling table for the menu.
 *
 * A table that can scroll sideways clips whatever leaves it, and a row's own
 * menu is one of those things — with a single row the menu is taller than the
 * table it hangs out of, and its lower half was cut off. The table is grown by
 * however far the menu overhangs, which leaves the sideways scroll alone;
 * switching the clip off instead would let a wide table spill out of its card
 * on a phone.
 *
 * Asks the table how much of it cannot be seen rather than measuring the menu
 * against it. The menu's own box reports as fitting even when it does not, and
 * the difference the table reports is the part actually being cut off.
 *
 * The padding is cleared before measuring so that a menu opening while another
 * closes is measured against the table's own height, not a padded one.
 */
function makeRoomForMenu(): void {
    const table = scroller()

    if (!table) {
        return
    }

    void nextTick(() => {
        table.style.paddingBottom = ''

        if (!table.querySelector('.dropdown-menu.show')) {
            return
        }

        const hidden = table.scrollHeight - table.clientHeight

        if (hidden > 0) {
            table.style.paddingBottom = `${hidden + 8}px`
        }
    })
}

watch(open, makeRoomForMenu)

onMounted(() => document.addEventListener('click', onDocumentClick))

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)

    // Leaving with the menu open would strand the extra room on the table.
    const table = scroller()

    if (table) {
        table.style.paddingBottom = ''
    }
})
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
