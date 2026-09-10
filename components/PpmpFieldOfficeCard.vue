<script setup lang="ts">
import { computed } from 'vue'
import { fieldOfficeMap, PPMP_ROLE } from '~/data/reference'
import type { Ppmp } from '~/data/demo'

/**
 * Where every Division/Field Office stands on one PPMP, and the actions the
 * viewer may take on each.
 *
 * Admin and the Supply Officer act on any office; everyone else only on their
 * own.
 */
const props = defineProps<{ plan: Ppmp }>()

const auth = useAuthStore()
const store = usePpmpStore()
const modal = usePimsModal()

const role = computed(() => auth.ppmpRoleId)
const isAdmin = computed(() => role.value === PPMP_ROLE.admin)
const isFOHead = computed(() => role.value === PPMP_ROLE.fieldOfficeHead)
const isSupplyOfficer = computed(() => role.value === PPMP_ROLE.supplyOfficer)
const isSupplyDesignate = computed(() => role.value === PPMP_ROLE.supplyDesignate)
const isRegularEmployee = computed(() => role.value === PPMP_ROLE.employee)

const participatingOffices = computed(() => store.fieldOfficeIdsFor(props.plan.id))

/** The message above the office list depends on where the plan has got to. */
const deadlineNotice = computed(() => {
    switch (props.plan.status_id) {
        case 1:
            return {
                message:
                    'To Supply Designates, please upload your signed PPMP Form and ensure that all digital PPMP submissions are fully completed and finalized on or before:',
                deadline: props.plan.designate_deadline_at,
            }
        case 3:
            return {
                message:
                    'Submitting of PPMP Project Items is currently CLOSED, please wait until the RO Supply Officer has finished reviewing the submitted items. Status will be updated on or before:',
                deadline: props.plan.supply_deadline_at,
            }
        case 4:
            return {
                message:
                    'PPMP Items have already been REVIEWED by the RO Supply Officer, pending revision/s (if any) from the Budget Officer. Status will be updated on or before:',
                deadline: props.plan.budget_deadline_at,
            }
        case 5:
            return {
                message:
                    'PPMP Items have been APPROVED by the Budget Officer, you may now print the revised PPMP Form. Uploading of the revised signed PPMP Form must be submitted on or before:',
                deadline: props.plan.upload_deadline_at,
            }
        default:
            return { message: '-', deadline: null as string | null }
    }
})

/** Argon badge colour per field-office status, keyed by pims_ppmp_statuses.id. */
function officeStatusClass(statusId: number | undefined): string {
    switch (statusId) {
        case 18:
            return 'badge-primary'
        case 16:
            return 'badge-secondary'
        case 15:
            return 'badge-success'
        case 14:
            return 'badge-warning'
        case 13:
            return 'badge-info'
        default:
            return 'badge-secondary'
    }
}

/** The actions a Division/Field Office row offers, in the order they appear. */
function fieldOfficeActions(officeId: number): string[] {
    const statusId = store.fieldOfficeStatus(props.plan.id, officeId)?.status_id
    const actions: string[] = []

    if (props.plan.status_id === 1) {
        if (statusId !== undefined && [16, 18].includes(statusId)) {
            actions.push('reopen')
        }
        if (statusId !== 18) {
            actions.push('complete')
        }
        if (statusId !== 15) {
            actions.push('approve')
        }
        if (statusId !== 14) {
            actions.push('resubmit')
        }
        actions.push('upload_ppmp')
    }

    if (props.plan.status_id !== 5) {
        actions.push('print_ppmp')
    }

    if (props.plan.status_id === 5) {
        actions.push('approve', 'resubmit', 'print_approved', 'upload_approved')
    }

    return actions
}

function canActOnOffice(officeId: number): boolean {
    return (
        [PPMP_ROLE.admin, PPMP_ROLE.supplyOfficer].includes(role.value as 1 | 4) ||
        officeId === auth.user.area_office_id
    )
}

const actionLabels: Record<string, string> = {
    reopen: 'Re-open',
    complete: 'Tag as Completed',
    approve: 'Approve Signed Submission',
    resubmit: 'Tag as Pending of Resubmission',
    upload_ppmp: 'Upload Signed PPMP Form',
    print_ppmp: 'Generate Printable PPMP Form',
    print_approved: 'Generate Printable Approved PPMP Form',
    upload_approved: 'Upload Signed Approved PPMP Form',
}

/** Which roles may actually press each action. */
function canRunAction(action: string): boolean {
    switch (action) {
        case 'reopen':
        case 'complete':
        case 'resubmit':
            return isSupplyDesignate.value || isAdmin.value
        case 'approve':
            return isSupplyDesignate.value || isAdmin.value || isFOHead.value
        case 'upload_ppmp':
        case 'upload_approved':
            return isSupplyDesignate.value || isRegularEmployee.value || isAdmin.value
        case 'print_ppmp':
        case 'print_approved':
            return isAdmin.value || isSupplyOfficer.value || isFOHead.value || isSupplyDesignate.value
        default:
            return false
    }
}

async function runFieldOfficeAction(officeId: number, action: string): Promise<void> {
    if (action === 'print_ppmp' || action === 'print_approved') {
        await modal.notice({
            title: 'Printable PPMP Form',
            text: 'Generating the printable form needs the reporting service, which this front-end demo does not carry.',
        })

        return
    }

    if (action === 'upload_ppmp' || action === 'upload_approved') {
        store.uploadFieldOfficeForm(props.plan.id, officeId, `signed-ppmp-${officeId}.pdf`)
        modal.success('Signed PPMP Form uploaded successfully')

        return
    }

    const confirmed = await modal.confirm({
        title:
            action === 'approve'
                ? 'RO Supply Officer Confirmation'
                : 'Supply Designate Confirmation',
        text: `Are you sure you want to ${actionLabels[action].toLowerCase()} for ${fieldOfficeMap[officeId]}?`,
        confirmText: actionLabels[action],
        variant: action === 'resubmit' ? 'warning' : 'success',
    })

    if (!confirmed) {
        return
    }

    store.toggleFieldOfficeStatus(
        props.plan.id,
        officeId,
        action as 'reopen' | 'complete' | 'approve' | 'resubmit',
        action === 'resubmit' ? 'Pending resubmission — see the Supply Officer for details.' : null,
    )

    modal.success('Division/Field Office status updated')
}
</script>

<template>
    <div class="card bg-gradient-info shadow-sm mb-4 position-relative overflow-hidden">
        <div class="card-header bg-transparent">
            <div class="row align-items-center">
                <div class="col">
                    <h4 class="mb-0 text-dark text-uppercase">Division/Field Office Status</h4>
                </div>
            </div>

            <i
                class="ni ni-building text-white position-absolute"
                style="font-size: 18rem; right: 15px; top: 350px; opacity: 0.25"
                aria-hidden="true"
            ></i>

            <div class="mt-4">
                <h4 class="mb-0 text-dark font-weight-normal">
                    {{ deadlineNotice.message }}<br />
                    <strong v-if="deadlineNotice.deadline">
                        {{ longDate(deadlineNotice.deadline) }}
                    </strong>
                </h4>
            </div>
        </div>

        <div class="card-body p-0">
            <div
                v-for="(officeName, officeId) in fieldOfficeMap"
                :key="officeId"
                class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
            >
                <div class="d-flex align-items-center">
                    <span
                        class="font-weight-bold text-dark ml-2"
                        style="min-width: 80px; display: inline-block"
                    >
                        {{ officeName }}
                    </span>

                    <div style="min-width: 100px">
                        <span
                            class="badge badge-pill"
                            :class="
                                participatingOffices.includes(Number(officeId))
                                    ? 'badge-success'
                                    : 'badge-dark text-white'
                            "
                        >
                            {{
                                participatingOffices.includes(Number(officeId))
                                    ? 'Included'
                                    : 'Not Included'
                            }}
                        </span>
                    </div>
                </div>

                <div
                    v-if="participatingOffices.includes(Number(officeId))"
                    class="d-flex align-items-center"
                >
                    <span
                        class="badge badge-pill"
                        :class="
                            officeStatusClass(
                                store.fieldOfficeStatus(plan.id, Number(officeId))?.status_id,
                            )
                        "
                    >
                        {{
                            store.statusName(
                                store.fieldOfficeStatus(plan.id, Number(officeId))?.status_id ?? null,
                            )
                        }}
                    </span>

                    <AppDropdown
                        v-if="canActOnOffice(Number(officeId))"
                        wrapper-class="dropdown ml-3"
                        align-right
                    >
                        <template #trigger="{ toggle }">
                            <button class="btn btn-sm btn-white dropdown-toggle" type="button" @click="toggle">
                                Actions
                            </button>
                        </template>

                        <template v-for="action in fieldOfficeActions(Number(officeId))" :key="action">
                            <button
                                v-if="canRunAction(action)"
                                type="button"
                                class="dropdown-item"
                                @click="runFieldOfficeAction(Number(officeId), action)"
                            >
                                {{ actionLabels[action] }}
                            </button>
                        </template>
                    </AppDropdown>
                </div>
            </div>
        </div>
    </div>
</template>
