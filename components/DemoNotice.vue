<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

/**
 * The notice every visitor meets on arrival.
 *
 * It says plainly what this is, so nobody mistakes a portfolio piece for a
 * system in service, and it points at the write-up behind it.
 *
 * Deliberately not dismissible by clicking away or pressing Escape: it is shown
 * once per visit and asks for one deliberate press, which is the whole reason
 * it is here rather than being a banner that gets scrolled past.
 */
const open = ref(true)

/** Stops the page behind scrolling while the notice is up. */
watch(
    open,
    (isOpen) => {
        if (import.meta.client) {
            document.body.classList.toggle('demo-notice-open', isOpen)
        }
    },
    { immediate: true },
)

onBeforeUnmount(() => {
    if (import.meta.client) {
        document.body.classList.remove('demo-notice-open')
    }
})
</script>

<template>
    <div>
        <!--
             The motion below is on the dialog, not on this element. Vue times a
             transition by reading the computed style of the element it is given,
             which here has none, so it would drop the active class before the
             dialog had moved. The duration is stated instead, and must match the
             timings in the styles below.
        -->
        <Transition name="notice" :duration="{ enter: 320, leave: 200 }" appear>
            <div
                v-if="open"
                class="modal demo-notice"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="demo-notice-title"
            >
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 id="demo-notice-title" class="modal-title">
                                <i class="ni ni-cart text-primary mr-2" aria-hidden="true"></i>
                                This is a demo
                            </h5>
                        </div>

                        <div class="modal-body">
                            <p>
                                You are looking at a front-end demonstration of the
                                <strong>Procurement and Inventory Management System (PIMS)</strong>,
                                a module of a wider Central System.
                            </p>

                            <p>
                                This demo is built with <strong>Nuxt</strong> and
                                <strong>Vue</strong>, and it runs entirely in your browser — there is
                                no server and no database behind it. The working system it is modelled
                                on is built with <strong>PHP</strong>, <strong>Laravel</strong>,
                                <strong>Blade</strong> and <strong>MySQL</strong>.
                            </p>

                            <p>
                                That system also sits behind a
                                <strong>login and authentication</strong>, so a request can only be
                                opened by the offices entitled to see it. That is stood down here on
                                purpose — the account menu in the top right takes its place, so you
                                can look around as each role.
                            </p>

                            <p class="mb-0 text-muted text-sm">
                                Every name, office and amount you will see here is invented. Nothing is
                                saved: reload the page and the demo starts over.
                            </p>
                        </div>

                        <div class="modal-footer demo-notice__footer">
                            <div class="demo-notice__links">
                                <a
                                    href="https://ljar.vercel.app/"
                                    class="btn btn-outline-primary"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    <i class="ni ni-single-02 mr-1" aria-hidden="true"></i>
                                    Visit my Portfolio
                                </a>

                                <a
                                    href="https://ljar.vercel.app/projects/pims"
                                    class="btn btn-outline-primary"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    <i class="ni ni-single-copy-04 mr-1" aria-hidden="true"></i>
                                    Read the Case Study
                                </a>
                            </div>

                            <button
                                type="button"
                                class="btn btn-secondary demo-notice__close"
                                autofocus
                                @click="open = false"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- No click handler: the notice closes from its own button only. -->
        <Transition name="notice-backdrop" appear>
            <div v-if="open" class="modal-backdrop demo-notice__backdrop"></div>
        </Transition>
    </div>
</template>

<style scoped>
/*
 * Bootstrap fade and show classes are left off both elements on purpose.
 * They set opacity, and a dialog transform, from selectors specific enough to
 * outrank the transition rules below, which would leave the animation with
 * nothing left to move.
 */
.demo-notice {
    display: block;
    /* Above the sidebar, which Argon puts at 1050. */
    z-index: 1080;
}

/*
 * Wider than the 500px Bootstrap settles on, which left the notice a narrow
 * column of text far taller than it was across. Nearer square reads as a
 * greeting rather than a page.
 */
.demo-notice .modal-dialog {
    max-width: 640px;
}

.demo-notice__backdrop {
    z-index: 1070;
    opacity: 0.4;
}

/* The two links invite you somewhere; Close just dismisses. Setting them on
   separate rows with real space between keeps the dismissal from reading as a
   third option alongside them. */
.demo-notice__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.demo-notice__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.demo-notice__footer .btn {
    margin: 0;
}

/* ── Motion ──────────────────────────────────────────────────────────────
   The dialog rises and settles while the backdrop fades under it, so the
   notice arrives rather than appearing already formed.

   Bootstrap's own fade/show classes are left off both elements on purpose:
   they set opacity and a dialog transform from selectors specific enough to
   outrank these, which would leave the animation with nothing to move. */
.notice-enter-active .modal-dialog {
    transition:
        opacity 0.32s ease,
        transform 0.32s cubic-bezier(0.2, 0.8, 0.25, 1);
}

.notice-leave-active .modal-dialog {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.demo-notice.notice-enter-from .modal-dialog {
    opacity: 0;
    transform: translateY(1.5rem) scale(0.96);
}

.demo-notice.notice-leave-to .modal-dialog {
    opacity: 0;
    transform: translateY(0.75rem) scale(0.98);
}

.notice-backdrop-enter-active,
.notice-backdrop-leave-active {
    transition: opacity 0.28s ease;
}

.demo-notice__backdrop.notice-backdrop-enter-from,
.demo-notice__backdrop.notice-backdrop-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .notice-enter-active .modal-dialog,
    .notice-leave-active .modal-dialog,
    .notice-backdrop-enter-active,
    .notice-backdrop-leave-active {
        transition: none;
    }

    .demo-notice.notice-enter-from .modal-dialog,
    .demo-notice.notice-leave-to .modal-dialog {
        transform: none;
    }
}

@media (max-width: 575.98px) {
    /* Stacked full-width buttons beat three cramped ones on a phone. */
    .demo-notice__links {
        width: 100%;
        flex-direction: column;
    }

    .demo-notice__links > .btn,
    .demo-notice__close {
        width: 100%;
    }
}
</style>
