import { reactive } from 'vue'

/**
 * The shared PIMS confirmations.
 *
 * The Blade build drove one set of Bootstrap modals from a small jQuery helper
 * (public/js/PIMS/shared/pimsModals.js) so PPMP and Purchase Request confirmed
 * actions the same way. This is that helper as reactive state: the markup lives
 * in components/PimsModal.vue, which every layout renders once.
 *
 *   const modal = usePimsModal()
 *
 *   modal.confirm({ title, text, confirmText, variant }).then((confirmed) => …)
 *   modal.notice({ title, text })
 *   modal.success('Saved successfully')
 */

export type ModalVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'

export interface ConfirmOptions {
    title: string
    text?: string
    confirmText?: string
    cancelText?: string
    variant?: ModalVariant
}

export interface NoticeOptions {
    title: string
    text?: string
    dismissText?: string
    variant?: ModalVariant
}

interface ModalState {
    kind: 'confirm' | 'notice' | 'success' | null
    title: string
    text: string
    confirmText: string
    cancelText: string
    dismissText: string
    variant: ModalVariant
}

const state = reactive<ModalState>({
    kind: null,
    title: '',
    text: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    dismissText: 'Close',
    variant: 'primary',
})

/** Only one modal is ever on screen, so one pending resolver is enough. */
let resolver: ((confirmed: boolean) => void) | null = null
let successTimer: ReturnType<typeof setTimeout> | null = null

function settle(confirmed: boolean): void {
    const resolve = resolver

    resolver = null
    state.kind = null

    resolve?.(confirmed)
}

export function usePimsModal() {
    return {
        state,

        /**
         * Ask before doing something. Resolves true only when the confirm button
         * is pressed — dismissing any other way resolves false, so a caller can
         * always branch on one boolean.
         */
        confirm(options: ConfirmOptions): Promise<boolean> {
            settle(false)

            state.kind = 'confirm'
            state.title = options.title
            state.text = options.text ?? ''
            state.confirmText = options.confirmText ?? 'Confirm'
            state.cancelText = options.cancelText ?? 'Cancel'
            state.variant = options.variant ?? 'primary'

            return new Promise<boolean>((resolve) => {
                resolver = resolve
            })
        },

        /** Tell the user something they only have to acknowledge. */
        notice(options: NoticeOptions): Promise<boolean> {
            settle(false)

            state.kind = 'notice'
            state.title = options.title
            state.text = options.text ?? ''
            state.dismissText = options.dismissText ?? 'Close'
            state.variant = options.variant ?? 'secondary'

            return new Promise<boolean>((resolve) => {
                resolver = resolve
            })
        },

        /** Report a completed action; it closes itself. */
        success(message: string, autoCloseMs = 2000): void {
            settle(false)

            state.kind = 'success'
            state.title = ''
            state.text = message

            if (successTimer) {
                clearTimeout(successTimer)
            }

            successTimer = setTimeout(() => {
                if (state.kind === 'success') {
                    settle(true)
                }
            }, autoCloseMs)
        },

        /** Close whatever is on screen, reporting the outcome to the caller. */
        dismiss(confirmed = false): void {
            settle(confirmed)
        },
    }
}
