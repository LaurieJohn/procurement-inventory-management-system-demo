<script setup lang="ts">
/**
 * The shared PIMS confirmation / notice / success modals.
 *
 * Carries the markup the Blade partial used verbatim — static backdrop, centred
 * dialog, Cancel plus one coloured action — but shown and hidden by Vue rather
 * than by Bootstrap's own jQuery plugin, so the demo needs no jQuery at all.
 */
const modal = usePimsModal()
const state = modal.state
</script>

<template>
    <div>
        <!-- Confirm an action -->
        <div
            class="modal fade"
            :class="{ show: state.kind === 'confirm' }"
            :style="{ display: state.kind === 'confirm' ? 'block' : 'none' }"
            tabindex="-1"
            role="dialog"
        >
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ state.title }}</h5>
                        <button type="button" class="close" @click="modal.dismiss(false)">
                            <span>&times;</span>
                        </button>
                    </div>

                    <div class="modal-body text-center">{{ state.text }}</div>

                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-secondary" @click="modal.dismiss(false)">
                            {{ state.cancelText }}
                        </button>

                        <button
                            type="button"
                            class="btn"
                            :class="`btn-${state.variant}`"
                            @click="modal.dismiss(true)"
                        >
                            {{ state.confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Report something that only needs acknowledging -->
        <div
            class="modal fade"
            :class="{ show: state.kind === 'notice' }"
            :style="{ display: state.kind === 'notice' ? 'block' : 'none' }"
            tabindex="-1"
            role="dialog"
        >
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ state.title }}</h5>
                        <button type="button" class="close" @click="modal.dismiss(false)">
                            <span>&times;</span>
                        </button>
                    </div>

                    <div class="modal-body text-center">{{ state.text }}</div>

                    <div class="modal-footer justify-content-center">
                        <button
                            type="button"
                            class="btn"
                            :class="`btn-${state.variant}`"
                            @click="modal.dismiss(true)"
                        >
                            {{ state.dismissText }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- A completed action, which closes itself -->
        <div
            class="modal fade"
            :class="{ show: state.kind === 'success' }"
            :style="{ display: state.kind === 'success' ? 'block' : 'none' }"
            tabindex="-1"
        >
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-success">
                    <div class="modal-body text-center py-4">
                        <h4 class="mb-0 font-weight-bold">{{ state.text }}</h4>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="state.kind" class="modal-backdrop fade show"></div>
    </div>
</template>
