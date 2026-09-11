import { computed, ref, watch } from 'vue'

/**
 * Argon's xl breakpoint. Above it the sidebar sits beside the content and the
 * page is shifted across; below it there is nowhere for it to sit, so Argon
 * slides it off-canvas and lets it cover the page when opened.
 */
const DESKTOP_QUERY = '(min-width: 1200px)'

/**
 * Whether the sidebar is open.
 *
 * Argon drives this from classes on `<body>`. Open is
 * `g-sidenav-show g-sidenav-pinned`: 250px wide, and on a wide screen the main
 * content is pushed across by the same amount. Closed is `g-sidenav-hidden`
 * *without* `g-sidenav-show`, which collapses it to the 62px icon rail on a wide
 * screen and pushes it off-screen entirely on a narrow one — the compact rules
 * are all written as `.g-sidenav-hidden:not(.g-sidenav-show)`, so leaving
 * `g-sidenav-show` on would make the togglers do nothing.
 *
 * Argon's own jQuery script set these from a cookie; here they follow a ref.
 */
const open = ref(true)

/** Whether there is room for the sidebar to sit beside the content. */
const isDesktop = ref(true)

/** The media listener is global state, so it is only ever wired up once. */
let initialised = false

export function useSidenav() {
    /**
     * Open on a screen too narrow to hold it — the sidebar is covering the page
     * and needs a backdrop and an obvious way out.
     */
    const isOverlay = computed(() => !isDesktop.value && open.value)

    if (import.meta.client && !initialised) {
        initialised = true

        const media = window.matchMedia(DESKTOP_QUERY)

        /**
         * A wide screen opens with the sidebar in place; a phone opens with it
         * away, or it would cover most of the screen with nothing to dismiss it.
         * Crossing the breakpoint re-applies that default rather than carrying
         * the old state into a layout it does not suit.
         */
        const applyViewport = (matches: boolean): void => {
            isDesktop.value = matches
            open.value = matches
        }

        applyViewport(media.matches)
        media.addEventListener('change', (event) => applyViewport(event.matches))

        watch(
            [open, isDesktop],
            ([isOpen, onDesktop]) => {
                document.body.classList.toggle('g-sidenav-show', isOpen)
                document.body.classList.toggle('g-sidenav-pinned', isOpen)
                document.body.classList.toggle('g-sidenav-hidden', !isOpen)

                // Keeps the page behind from scrolling under the overlay.
                document.body.classList.toggle('sidenav-open', !onDesktop && isOpen)
            },
            { immediate: true },
        )
    }

    return {
        open,
        isDesktop,
        isOverlay,
        toggle: () => {
            open.value = !open.value
        },
        close: () => {
            open.value = false
        },
    }
}
