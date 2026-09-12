<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * The shared PIMS confirmation / notice / success modals.
 *
 * Carries the markup the Blade partial used verbatim — centred dialog, Cancel
 * plus one coloured action — but shown and hidden by Vue rather than by
 * Bootstrap's own jQuery plugin, so the demo needs no jQuery at all.
 */
const modal = usePimsModal()
const state = modal.state

/**
 * What the dialog is showing, held apart from the live state.
 *
 * The dialog fades out now rather than vanishing, and by the time it starts to
 * go `state` has already been cleared — and may well have been filled in again
 * for the next one, since confirming something usually reports a result a tick
 * later. Read live, a success message would turn back into the confirmation it
 * came from on its way off screen. This keeps the last thing worth showing.
 */
const shown = ref({ ...state })

watch(state, () => {
    if (state.kind !== null) {
        shown.value = { ...state }
    }
})
</script>

<template>
    <AppModal :open="state.kind !== null">
        <div class="modal-content" :class="{ 'border-success': shown.kind === 'success' }">
            <!-- A completed action, which closes itself -->
            <div v-if="shown.kind === 'success'" class="modal-body text-center py-4">
                <h4 class="mb-0 font-weight-bold">{{ shown.text }}</h4>
            </div>

            <!-- An action to confirm, or something that only needs acknowledging -->
            <template v-else>
                <div class="modal-header">
                    <h5 class="modal-title">{{ shown.title }}</h5>
                    <button type="button" class="close" @click="modal.dismiss(false)">
                        <span>&times;</span>
                    </button>
                </div>

                <div class="modal-body text-center">
                    {{ shown.text }}

                    <!-- A notice that can point somewhere says so under the message. -->
                    <p v-if="shown.link" class="mt-3 mb-0">
                        <a :href="shown.link.href" target="_blank" rel="noopener">
                            {{ shown.link.label }}
                        </a>
                    </p>
                </div>

                <div class="modal-footer justify-content-center">
                    <button
                        v-if="shown.kind === 'confirm'"
                        type="button"
                        class="btn btn-secondary"
                        @click="modal.dismiss(false)"
                    >
                        {{ shown.cancelText }}
                    </button>

                    <button
                        type="button"
                        class="btn"
                        :class="`btn-${shown.variant}`"
                        @click="modal.dismiss(true)"
                    >
                        {{ shown.kind === 'confirm' ? shown.confirmText : shown.dismissText }}
                    </button>
                </div>
            </template>
        </div>
    </AppModal>
</template>
