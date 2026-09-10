<script setup lang="ts">
import { computed } from 'vue'
import { PPMP_ROLE } from '~/data/reference'
import type { Ppmp } from '~/data/demo'

/**
 * The PPMP header card: what the plan is, and the actions that move it along.
 *
 * Shared by the requester page and the admin one — the plan's status
 * transitions are the same wherever they are triggered from.
 */
const props = defineProps<{ plan: Ppmp }>()

const auth = useAuthStore()
const store = usePpmpStore()
const modal = usePimsModal()

const role = computed(() => auth.ppmpRoleId)
const isAdmin = computed(() => role.value === PPMP_ROLE.admin)
const isBudgetOfficer = computed(() => role.value === PPMP_ROLE.budgetOfficer)

interface PlanAction {
    key: 'submit' | 'forapprove' | 'approve' | 'reopen'
    label: string
    title: string
    message: string
    confirmText: string
    className: string
}

/** Which transitions this viewer may make from the plan's current status. */
const planActions = computed<PlanAction[]>(() => {
    const actions: PlanAction[] = []
    const canManage = [PPMP_ROLE.admin, PPMP_ROLE.supplyOfficer].includes(role.value as 1 | 4)

    if (props.plan.status_id === 1) {
        actions.push({
            key: 'submit',
            label: 'Close PPMP for reviewing',
            title: 'Close PPMP',
            message:
                "Are you sure you want to set the current status of this PPMP to 'Closed'? Note: Divisions & Field Offices included on this PPMP will be unable to Add/Edit/Remove their submitted Project Items.",
            confirmText: 'Close PPMP',
            className: 'text-success',
        })
    }

    if ([3, 4, 5].includes(props.plan.status_id) && auth.isPpmpAdmin) {
        actions.push({
            key: 'reopen',
            label: 'Re-open PPMP (Admin)',
            title: 'Re-open PPMP',
            message:
                'Are you sure you want to reopen the current PPMP? Divisions & Field Offices included on this PPMP will be able to modify their submitted Project Items once again.',
            confirmText: 'Re-open PPMP',
            className: '',
        })
    }

    if (props.plan.status_id === 3 && canManage) {
        actions.push({
            key: 'forapprove',
            label: 'Submit current PPMP for approval',
            title: 'Submit for Approval',
            message:
                'Are you sure you want to submit the current PPMP for approval? Divisions & Field Offices included on this PPMP (including the RO Supply Officer) will be unable to modify any submitted Project Items during this time.',
            confirmText: 'Submit for Approval',
            className: 'text-success',
        })
    }

    if (props.plan.status_id === 4 && (isBudgetOfficer.value || isAdmin.value)) {
        actions.push({
            key: 'approve',
            label: 'Approve and submit revised PPMP',
            title: 'Approve PPMP',
            message: 'Are you sure you want to approve and submit the updated revised PPMP?',
            confirmText: 'Approve PPMP',
            className: 'text-success',
        })
    }

    return actions
})

/** Supply revises the item details; Budget prices them. */
const canReviseItems = computed(
    () => props.plan.status_id === 3 && [PPMP_ROLE.admin, PPMP_ROLE.supplyOfficer].includes(role.value as 1 | 4),
)

const canReviseBudget = computed(
    () => props.plan.status_id === 4 && (isBudgetOfficer.value || isAdmin.value),
)

async function runPlanAction(action: PlanAction): Promise<void> {
    const confirmed = await modal.confirm({
        title: action.title,
        text: action.message,
        confirmText: action.confirmText,
        variant: 'success',
    })

    if (!confirmed) {
        return
    }

    store.togglePpmpStatus(props.plan.id, action.key)
    modal.success('PPMP status updated successfully')
}

async function exportExcel(): Promise<void> {
    await modal.notice({
        title: 'Generate APP Non-CSE',
        text: 'The spreadsheet export needs the reporting service, which this front-end demo does not carry.',
    })
}
</script>

<template>
    <div class="card bg-gradient-blue border-0 shadow-sm mb-4 position-relative overflow-hidden">
        <i
            class="ni ni-folder-17 text-white position-absolute"
            style="font-size: 11rem; right: 15px; top: 100px; opacity: 0.25"
            aria-hidden="true"
        ></i>

        <div class="card-body">
            <div class="d-flex align-items-start">
                <div class="flex-grow-1">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h4 class="card-title mb-0 text-white">PPMP Title:</h4>
                        </div>
                        <div class="col-md-9">
                            <p class="mb-0 text-white h2 font-weight-bold">{{ plan.name }}</p>
                        </div>
                    </div>

                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h4 class="card-title mb-0 text-white">Type:</h4>
                        </div>
                        <div class="col-md-9">
                            <p class="mb-0 text-white">{{ store.typeName(plan.type_id) }}</p>
                        </div>
                    </div>

                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h4 class="card-title mb-0 text-white">Version No.:</h4>
                        </div>
                        <div class="col-md-9">
                            <p class="mb-0 text-white">{{ plan.version_no ?? '-' }}</p>
                        </div>
                    </div>

                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h4 class="card-title mb-0 text-white">Fiscal Year:</h4>
                        </div>
                        <div class="col-md-9">
                            <p class="mb-0 text-white">{{ plan.fiscal_year }}</p>
                        </div>
                    </div>

                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h4 class="card-title mb-0 text-white">Created At:</h4>
                        </div>
                        <div class="col-md-9">
                            <p class="mb-0 text-white">{{ longDate(plan.created_at) }}</p>
                        </div>
                    </div>

                    <div class="row align-items-center mb-2">
                        <div class="col-md-3">
                            <h4 class="card-title mb-0 text-white">Submission Deadline:</h4>
                        </div>
                        <div class="col-md-9">
                            <p class="mb-0 text-white">{{ longDate(plan.ppmp_deadline_at) }}</p>
                        </div>
                    </div>

                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h4 class="card-title mb-0 text-white">Status:</h4>
                        </div>
                        <div class="col-md-9">
                            <span class="badge badge-lg badge-primary">
                                {{ store.statusName(plan.status_id) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="ml-3 d-flex flex-column align-items-center">
                    <AppDropdown wrapper-class="dropdown d-inline-block mt-1" align-right>
                        <template #trigger="{ toggle }">
                            <a
                                href="#"
                                class="icon icon-shape bg-white text-dark rounded-circle shadow btn-icon-clipboard"
                                title="PPMP Actions"
                                @click.prevent="toggle"
                            >
                                <i class="fas fa-chevron-down"></i>
                            </a>
                        </template>

                        <a href="#" class="dropdown-item text-primary" @click.prevent="exportExcel">
                            Generate APP Non-CSE
                        </a>

                        <button
                            v-for="action in planActions"
                            :key="action.key"
                            type="button"
                            class="dropdown-item"
                            :class="action.className"
                            @click="runPlanAction(action)"
                        >
                            {{ action.label }}
                        </button>

                        <NuxtLink
                            v-if="canReviseItems"
                            class="dropdown-item text-primary"
                            :to="`/PIMS/PPMP/supply/${plan.id}/items/edit`"
                        >
                            Modify Project Item Details on this PPMP
                        </NuxtLink>

                        <NuxtLink
                            v-if="canReviseBudget"
                            class="dropdown-item text-primary"
                            :to="`/PIMS/PPMP/budget/${plan.id}/items/edit`"
                        >
                            Modify Authorized Budgetary Allocation (PhP) on this PPMP
                        </NuxtLink>
                    </AppDropdown>
                </div>
            </div>
        </div>
    </div>
</template>
