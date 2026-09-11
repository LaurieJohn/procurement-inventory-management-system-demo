<script setup lang="ts">
/**
 * A modal that eases in rather than appearing outright.
 *
 * The theme ships the motion for this, but only for its own jQuery plugin: the
 * plugin sets `display` first and adds `show` a frame later, which is what gives
 * the transition somewhere to start from. Driving the same classes from Vue set
 * both in one tick, so every dialog in the demo snapped into place instead.
 *
 * The motion is Vue's own transition classes here, and Bootstrap's `fade` and
 * `show` are left off entirely — their opacity and transform rules are specific
 * enough to outrank the ones below, which would leave nothing left to move.
 *
 * The dialog is a slot, so callers pass the `.modal-content` they already had.
 */
withDefaults(
    defineProps<{
        /** Whether the dialog is on screen. */
        open: boolean
        /** Extra classes for the dialog, for the theme's sizes such as `modal-lg`. */
        dialogClass?: string
    }>(),
    { dialogClass: '' },
)

/**
 * Vue times a transition by reading the computed style of the element it is
 * given. The motion below is on the dialog inside it, which leaves that element
 * with no timing of its own, so the active class would come off before the
 * dialog had moved. Stated here instead; keep it in step with the styles below.
 */
const DURATION = { enter: 280, leave: 180 }
</script>

<template>
    <div>
        <Transition name="app-modal" :duration="DURATION">
            <div v-if="open" class="modal app-modal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-dialog-centered" :class="dialogClass" role="document">
                    <slot />
                </div>
            </div>
        </Transition>

        <!--
             The backdrop stays put and fades on a class, rather than coming and
             going with the dialog. A confirmation that is answered and followed
             by a result closes one dialog and opens the next a tick later; were
             the backdrop leaving in between, the page would visibly undim and
             dim again. An element that never leaves simply turns back.
        -->
        <div
            class="modal-backdrop app-modal__backdrop"
            :class="{ 'app-modal__backdrop--open': open }"
        ></div>
    </div>
</template>

<style scoped>
/* The theme keeps `.modal` hidden until its own plugin shows it. */
.app-modal {
    display: block;
}

/*
 * Never takes the pointer: while a dialog is up the `.modal` above it already
 * covers the page, and while one is not, this must not swallow clicks.
 */
.app-modal__backdrop {
    opacity: 0;
    transition: opacity 0.24s ease;
    pointer-events: none;
}

/* The theme's own backdrop, from `.modal-backdrop.show`. */
.app-modal__backdrop--open {
    opacity: 0.16;
}

.app-modal-enter-active .modal-dialog {
    transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.2, 0.8, 0.25, 1);
}

.app-modal-leave-active .modal-dialog {
    transition: opacity 0.18s ease, transform 0.18s ease;
}

/* Drops in from above, the way the theme's own modal motion does. */
.app-modal.app-modal-enter-from .modal-dialog {
    opacity: 0;
    transform: translateY(-1.75rem) scale(0.97);
}

.app-modal.app-modal-leave-to .modal-dialog {
    opacity: 0;
    transform: translateY(-0.75rem) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
    .app-modal-enter-active .modal-dialog,
    .app-modal-leave-active .modal-dialog,
    .app-modal__backdrop {
        transition: none;
    }

    .app-modal.app-modal-enter-from .modal-dialog,
    .app-modal.app-modal-leave-to .modal-dialog {
        transform: none;
    }
}
</style>
