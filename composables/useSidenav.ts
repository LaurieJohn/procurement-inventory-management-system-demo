import { ref, watch } from 'vue'

/**
 * Whether the sidebar is pinned open.
 *
 * Argon drives this from classes on `<body>`. Pinned is
 * `g-sidenav-show g-sidenav-pinned`: the sidebar is 250px wide and the main
 * content is pushed across by the same amount. Unpinned is `g-sidenav-hidden`
 * *without* `g-sidenav-show`, which collapses it to the 62px icon rail — the
 * compact rules are all written as `.g-sidenav-hidden:not(.g-sidenav-show)`, so
 * leaving `g-sidenav-show` on would make the toggler do nothing.
 *
 * Argon's own jQuery script set these from a cookie; here it is a ref the
 * togglers flip.
 */
const pinned = ref(true)

export function useSidenav() {
    if (import.meta.client) {
        watch(
            pinned,
            (isPinned) => {
                document.body.classList.toggle('g-sidenav-show', isPinned)
                document.body.classList.toggle('g-sidenav-pinned', isPinned)
                document.body.classList.toggle('g-sidenav-hidden', !isPinned)
            },
            { immediate: true },
        )
    }

    return {
        pinned,
        toggle: () => {
            pinned.value = !pinned.value
        },
    }
}
