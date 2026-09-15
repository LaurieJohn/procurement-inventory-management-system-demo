import { computed, effectScope, ref, watch } from 'vue'

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

        /*
         * An open sidebar covers the page on a narrow screen, so following any
         * link has to put it away — otherwise it stays spread over the page it
         * just went to.
         *
         * Wired to the router rather than watched from a component, for the
         * same reason as the classes below: moving between the two layouts
         * replaces the components, and the one watching the route was torn
         * down by the very navigation it needed to react to. That is why the
         * link into the administration console was the one that left the
         * sidebar open.
         */
        useRouter().afterEach(() => {
            if (!isDesktop.value) {
                open.value = false
            }
        })

        /*
         * Detached on purpose. A watcher started inside a component's setup
         * belongs to that component and is stopped when it unmounts — and the
         * first caller here is whichever navbar or backdrop happened to mount
         * first. Moving between the two layouts unmounts that one, which took
         * the watcher with it and left nothing writing these classes: the
         * sidebar then stayed spread over the page whatever the state said,
         * since `initialised` is set and never wires it up again.
         *
         * The state is the application's, so its watcher belongs to no one
         * component and runs for as long as the page is open.
         */
        effectScope(true).run(() => {
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
        })
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
