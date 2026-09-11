<script setup lang="ts">
import { computed, ref } from 'vue'
import { PPMP_ROLE } from '~/data/reference'
import { PR_STATUS } from '~/stores/purchase-request'

/**
 * One Purchase Request under review.
 *
 * Deciding on a submission is restricted to the Admin and the Supply Officer;
 * every other role reads the same page without the decision controls.
 */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const auth = useAuthStore()
const store = usePurchaseRequestStore()
const ppmp = usePpmpStore()
const modal = usePimsModal()

const id = computed(() => Number(route.params.id))
/**
 * Reached by URL as easily as by link, so the same visibility rule the listing
 * applies is checked here. Out of reach reads as not found rather than as
 * forbidden, which keeps the request's existence private.
 */
const procurement = computed(() => {
    const row = store.find(id.value)

    return row && store.canView(row, auth.userId, auth.ppmpRoleId) ? row : undefined
})

const lots = computed(() => (procurement.value ? store.lotsFor(procurement.value.id) : []))
const items = computed(() => (procurement.value ? store.itemsFor(procurement.value.id) : []))
const overallTotal = computed(() => (procurement.value ? store.totalFor(procurement.value.id) : 0))
const overallQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

const documents = computed(() => (procurement.value ? store.documentList(procurement.value) : []))
const missingRequiredDocuments = computed(() =>
    procurement.value ? store.missingRequiredDocuments(procurement.value) : [],
)
const stageRemarks = computed(() => (procurement.value ? store.stageRemarks(procurement.value) : []))

/** The status this request moves to when the current stage approves it. */
const nextStageLabel = computed(() => {
    if (!procurement.value) {
        return ''
    }

    const next = store.nextApprovalStatusId(procurement.value)

    return next === null ? '' : store.statusLabel(next)
})

/**
 * A decision is only possible while the request is somewhere on its route and
 * still awaiting one, and only from the two offices allowed to make it.
 */
const canDecide = computed(() => {
    if (!procurement.value) {
        return false
    }

    return (
        store.isAwaitingApproval(procurement.value) &&
        [PPMP_ROLE.admin, PPMP_ROLE.supplyOfficer].includes(auth.ppmpRoleId as 1 | 4)
    )
})

/**
 * Each office revises the item columns it owns before deciding: Supply the
 * units and quantities, Budget the unit costs.
 */
const canReviseAsSupply = computed(
    () =>
        auth.ppmpRoleId === PPMP_ROLE.admin &&
        procurement.value?.procurement_status_id === PR_STATUS.supplyOfficer,
)

const canReviseAsBudget = computed(
    () =>
        auth.ppmpRoleId === PPMP_ROLE.budgetOfficer &&
        procurement.value?.procurement_status_id === PR_STATUS.budgetOfficer,
)

const statusBadge = computed(() => {
    const statusId = Number(procurement.value?.procurement_status_id)

    if (statusId === PR_STATUS.approved) return 'badge-success'
    if (statusId === PR_STATUS.denied) return 'badge-danger'
    if (statusId === PR_STATUS.forResubmission) return 'badge-warning'
    if (statusId === PR_STATUS.closed) return 'badge-dark'
    if (statusId >= PR_STATUS.submitted) return 'badge-info'

    return 'badge-secondary'
})

/* ----- Decisions ----- */

/** Returning is the one decision the requester needs explained. */
const returnOpen = ref(false)
const returnRemarks = ref('')
const returnInvalid = ref(false)

const remarksOffice = computed(() => {
    if (!procurement.value) {
        return null
    }

    const column = store.remarksColumnForCurrentStage(procurement.value)

    return column
        ? (
              {
                  remarks_unit_head: 'Unit Head',
                  remarks_division_fo_head: 'Division/FO Head',
                  remarks_supply_officer: 'Supply Officer',
                  remarks_budget_officer: 'Budget Officer',
                  remarks_ord: 'ORD',
              } as Record<string, string>
          )[column]
        : null
})

async function approve(): Promise<void> {
    const completes = nextStageLabel.value === 'Approved'

    const confirmed = await modal.confirm({
        title: completes ? 'Approve this Purchase Request?' : 'Approve and forward?',
        text: completes
            ? 'This completes the approval route and marks the Purchase Request Approved.'
            : `The Purchase Request moves on to ${nextStageLabel.value}.`,
        confirmText: completes ? 'Approve' : 'Approve & Forward',
        variant: 'success',
    })

    if (!confirmed) {
        return
    }

    store.approve(id.value)
    modal.success('Purchase Request approved')
}

async function deny(): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Deny this Purchase Request?',
        text: 'Denying ends the approval route and hands control back to the requester.',
        confirmText: 'Deny',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.deny(id.value)
    modal.success('Purchase Request denied')
}

function openReturn(): void {
    returnRemarks.value = ''
    returnInvalid.value = false
    returnOpen.value = true
}

function submitReturn(): void {
    if (returnRemarks.value.trim() === '') {
        returnInvalid.value = true

        return
    }

    store.returnForResubmission(id.value, returnRemarks.value.trim())
    returnOpen.value = false

    modal.success('Purchase Request returned for resubmission')
}

function ppmpItemTitle(itemId: number | null): string {
    if (itemId === null) {
        return 'Not linked'
    }

    return ppmp.findItem(itemId)?.title ?? 'Not found'
}
</script>

<template>
    <div v-if="procurement">
        <PageHeader
            title="Purchase Request"
            back-to="/PIMS/admin/purchase-request"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/purchase-request', label: 'Index' },
                { label: procurement.title },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-xl-8">
                    <div class="card bg-gradient-blue border-0">
                        <div class="card-body position-relative">
                            <i
                                class="ni ni-box-2 text-white position-absolute"
                                style="
                                    font-size: 18rem;
                                    right: 20px;
                                    top: 80%;
                                    transform: translateY(-50%);
                                    opacity: 0.12;
                                    pointer-events: none;
                                "
                                aria-hidden="true"
                            ></i>

                            <div class="row pr-detail">
                                <div class="col-sm-4">
                                    <h4 class="card-title text-white mb-0">Created by:</h4>
                                </div>
                                <div class="col-sm-8">
                                    <h3 class="card-title text-uppercase text-white mb-0">
                                        {{ store.userName(procurement.user_id) }}
                                    </h3>
                                </div>
                            </div>

                            <div class="row pr-detail">
                                <div class="col-sm-4">
                                    <h4 class="card-title text-white mb-0">Requested by:</h4>
                                </div>
                                <div class="col-sm-8">
                                    <h3 class="card-title text-uppercase text-white mb-0">
                                        {{ procurement.request_by }}
                                    </h3>
                                </div>
                            </div>

                            <div class="row pr-detail">
                                <div class="col-sm-4">
                                    <h4 class="card-title text-white mb-0">Approved by:</h4>
                                </div>
                                <div class="col-sm-8">
                                    <h3 class="card-title text-uppercase text-white mb-0">
                                        {{ procurement.approved_by }}
                                    </h3>
                                </div>
                            </div>

                            <div class="row pr-detail">
                                <div class="col-sm-4">
                                    <h4 class="card-title text-white mb-0">Date of Procurement:</h4>
                                </div>
                                <div class="col-sm-8">
                                    <h3 class="card-title text-white mb-0">
                                        {{ longDate(procurement.date) }}
                                    </h3>
                                </div>
                            </div>

                            <div class="row pr-detail">
                                <div class="col-sm-4">
                                    <h4 class="card-title text-white mb-0">Status:</h4>
                                </div>
                                <div class="col-sm-8">
                                    <span class="badge badge-lg" :class="statusBadge">
                                        {{ store.statusLabel(procurement.procurement_status_id) }}
                                    </span>

                                    <span
                                        v-if="store.pendingWith(procurement)"
                                        class="text-white pr-lock-hint"
                                    >
                                        <i class="fas fa-user-clock"></i>
                                        Pending with {{ store.pendingWith(procurement) }}
                                    </span>
                                </div>
                            </div>

                            <div class="row pr-detail">
                                <div class="col-sm-4">
                                    <h4 class="card-title text-white mb-0">Title and Description:</h4>
                                </div>
                                <div class="col-sm-8">
                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        {{ procurement.title }}
                                    </h5>
                                    <p class="mb-0 text-sm text-white">{{ procurement.description }}</p>
                                </div>
                            </div>

                            <hr class="pr-documents__rule" />

                            <div class="d-flex align-items-center flex-wrap mb-2">
                                <h4 class="card-title text-white mb-0 mr-2">Documents on file:</h4>

                                <NuxtLink
                                    :to="`/PIMS/admin/purchase-request/${procurement.id}/attachments`"
                                    class="text-white text-sm ml-auto pr-documents__link"
                                >
                                    <i class="fas fa-eye mr-1"></i> View Documents
                                </NuxtLink>
                            </div>

                            <div class="pr-doc-list">
                                <span
                                    v-for="document in documents"
                                    :key="document.field"
                                    class="pr-doc"
                                    :class="
                                        document.stored
                                            ? 'is-uploaded'
                                            : document.required
                                              ? 'is-missing'
                                              : 'is-pending'
                                    "
                                >
                                    <i
                                        class="fas"
                                        :class="
                                            document.stored
                                                ? 'fa-check-circle'
                                                : document.required
                                                  ? 'fa-times-circle'
                                                  : 'far fa-circle'
                                        "
                                    ></i>
                                    {{ document.label }}
                                </span>
                            </div>

                            <!-- Remarks recorded along the route -->
                            <div v-if="stageRemarks.length" class="pr-remarks">
                                <div class="pr-remarks__label">Remarks:</div>

                                <div
                                    v-for="entry in stageRemarks"
                                    :key="entry.office"
                                    class="pr-remarks__entry"
                                >
                                    <b>{{ entry.office }}:</b> {{ entry.remark }}
                                </div>
                            </div>

                            <!-- The decision -->
                            <div class="pr-submit">
                                <template v-if="canDecide">
                                    <div class="pr-submit__notice">
                                        <i class="fas fa-gavel mr-1"></i>
                                        <b>
                                            Waiting for your decision at
                                            {{ store.statusLabel(procurement.procurement_status_id)
                                            }}<template v-if="store.pendingWith(procurement)">
                                                , pending with {{ store.pendingWith(procurement) }} </template
                                            >.
                                        </b>
                                        The requester can no longer change this Purchase Request.
                                        <template v-if="nextStageLabel === 'Approved'">
                                            Approving completes the route and marks it Approved.
                                        </template>
                                        <template v-else>
                                            Approving passes it to <b>{{ nextStageLabel }}</b
                                            >.
                                        </template>
                                        Denying or returning it hands control back to the requester.

                                        <div
                                            v-if="missingRequiredDocuments.length"
                                            class="pr-submit__blocked mt-1"
                                        >
                                            <i class="fas fa-exclamation-circle mr-1"></i>
                                            Note: {{ missingRequiredDocuments.join(', ') }}
                                            {{ missingRequiredDocuments.length === 1 ? 'is' : 'are' }}
                                            no longer on file.
                                        </div>
                                    </div>

                                    <div class="pr-submit__actions">
                                        <div class="pr-submit__decisions">
                                            <button type="button" class="btn btn-success" @click="approve">
                                                <i class="fas fa-check mr-1"></i>
                                                {{
                                                    nextStageLabel === 'Approved'
                                                        ? 'Approve'
                                                        : 'Approve & Forward'
                                                }}
                                            </button>

                                            <button type="button" class="btn btn-white" @click="openReturn">
                                                <i class="fas fa-undo mr-1"></i> Return for Resubmission
                                            </button>

                                            <button type="button" class="btn btn-danger" @click="deny">
                                                <i class="fas fa-times mr-1"></i> Deny
                                            </button>
                                        </div>

                                        <div
                                            v-if="canReviseAsSupply || canReviseAsBudget"
                                            class="pr-submit__review"
                                        >
                                            <NuxtLink
                                                v-if="canReviseAsSupply"
                                                :to="`/PIMS/purchase-request/supply/${procurement.id}/items/edit`"
                                                class="btn btn-white"
                                            >
                                                <i class="fas fa-boxes mr-1"></i> Review Items
                                            </NuxtLink>

                                            <NuxtLink
                                                v-if="canReviseAsBudget"
                                                :to="`/PIMS/purchase-request/budget/${procurement.id}/items/edit`"
                                                class="btn btn-white"
                                            >
                                                <i class="fas fa-coins mr-1"></i> Review Unit Costs
                                            </NuxtLink>
                                        </div>
                                    </div>
                                </template>

                                <div v-else class="pr-submit__notice">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    <b>{{ store.statusLabel(procurement.procurement_status_id) }}.</b>
                                    This Purchase Request is not waiting for a decision you can make,
                                    so there is nothing to approve or deny here.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4">
                    <div class="row">
                        <div class="col-xl-12 col-md-6">
                            <div class="card card-stats bg-gradient-blue">
                                <div class="card-body position-relative">
                                    <i
                                        class="ni ni-tag text-white position-absolute pr-stat__watermark"
                                        aria-hidden="true"
                                    ></i>

                                    <h5 class="card-title text-uppercase text-white mb-0">PR Type</h5>
                                    <span class="h2 font-weight-bold mb-0 text-white">
                                        {{ store.prTypeName(procurement.pr_type_id) ?? 'N/A' }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-12 col-md-6">
                            <div class="card card-stats bg-gradient-blue">
                                <div class="card-body position-relative">
                                    <i
                                        class="ni ni-briefcase-24 text-white position-absolute pr-stat__watermark"
                                        aria-hidden="true"
                                    ></i>

                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Mode of Procurement
                                    </h5>
                                    <span class="h2 font-weight-bold mb-0 text-white">
                                        {{
                                            store.modeProcurementName(
                                                procurement.mode_of_procurement_id,
                                            ) ?? 'N/A'
                                        }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-12 col-md-6">
                            <div class="card card-stats bg-gradient-blue">
                                <div class="card-body position-relative">
                                    <i
                                        class="ni ni-cart text-white position-absolute pr-stat__watermark"
                                        aria-hidden="true"
                                    ></i>

                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Total number of items
                                    </h5>
                                    <span class="h1 font-weight-bold mb-0 text-white">
                                        {{ items.length }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-12 col-md-6">
                            <div class="card card-stats bg-gradient-blue">
                                <div class="card-body position-relative">
                                    <i
                                        class="ni ni-money-coins text-white position-absolute pr-stat__watermark"
                                        aria-hidden="true"
                                    ></i>

                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Overall Total
                                    </h5>
                                    <span class="h1 font-weight-bold mb-0 text-white">
                                        {{ peso(overallTotal) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Every lot and item, in full -->
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-header border-0">
                            <h3 class="mb-0">Lots and Items</h3>
                            <p class="text-sm text-muted mb-0">
                                {{ lots.length }} {{ plural('lot', lots.length) }} &middot;
                                {{ items.length }} {{ plural('item', items.length) }}
                            </p>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-items-center table-flush">
                                <thead class="thead-light">
                                    <tr>
                                        <th><b>Lot</b></th>
                                        <th><b>Item Name</b></th>
                                        <th><b>Item Description</b></th>
                                        <th><b>PPMP Project Item</b></th>
                                        <th><b>Unit</b></th>
                                        <th class="text-right"><b>Quantity</b></th>
                                        <th class="text-right"><b>Unit Cost</b></th>
                                        <th class="text-right"><b>Total Unit Cost</b></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <template v-for="lot in lots" :key="lot.id">
                                        <tr v-for="item in store.itemsForLot(lot.id)" :key="item.id">
                                            <td>
                                                <NuxtLink
                                                    :to="`/PIMS/admin/purchase-request/lots/${lot.id}`"
                                                >
                                                    {{ lot.lot_no }}
                                                </NuxtLink>
                                            </td>
                                            <td>{{ item.item_name }}</td>
                                            <td style="white-space: pre-line; max-width: 22rem">
                                                {{ item.item_description }}
                                            </td>
                                            <td>{{ ppmpItemTitle(item.ppmp_project_item_id) }}</td>
                                            <td>{{ store.unitName(item.unit_id) }}</td>
                                            <td class="text-right">{{ count(item.quantity) }}</td>
                                            <td class="text-right">{{ peso(item.unit_cost) }}</td>
                                            <td class="text-right">{{ peso(item.total_unit_cost) }}</td>
                                        </tr>
                                    </template>

                                    <tr v-if="items.length === 0">
                                        <td colspan="8" class="text-center bg-light py-4">
                                            <small class="text-muted text-uppercase">
                                                This Purchase Request has no items yet.
                                            </small>
                                        </td>
                                    </tr>
                                </tbody>

                                <tfoot v-if="items.length" class="thead-light">
                                    <tr>
                                        <th colspan="5"></th>
                                        <th class="text-right">{{ count(overallQuantity) }}</th>
                                        <th></th>
                                        <th class="text-right">{{ peso(overallTotal) }}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Returning a Purchase Request is the one decision that must be explained -->
        <AppModal :open="returnOpen">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Return for Resubmission</h5>
                    <button type="button" class="close" @click="returnOpen = false">
                        <span>&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <p class="text-sm text-muted">
                        The requester gets this Purchase Request back and can edit it again.
                        Tell them what needs to change.
                    </p>

                    <div class="form-group mb-0">
                        <label class="form-control-label" for="returnRemarks">
                            Remarks
                            <span v-if="remarksOffice" class="text-muted">
                                &mdash; recorded against {{ remarksOffice }}
                            </span>
                        </label>

                        <textarea
                            id="returnRemarks"
                            v-model="returnRemarks"
                            class="form-control"
                            :class="{ 'is-invalid': returnInvalid }"
                            rows="4"
                        ></textarea>

                        <div v-if="returnInvalid" class="invalid-feedback d-block">
                            Say what needs to change before returning this Purchase Request.
                        </div>
                    </div>
                </div>

                <div class="modal-footer justify-content-center">
                    <button type="button" class="btn btn-secondary" @click="returnOpen = false">
                        Cancel
                    </button>

                    <button type="button" class="btn btn-warning" @click="submitReturn">
                        Return for Resubmission
                    </button>
                </div>
            </div>
        </AppModal>
    </div>

    <NotFoundCard
        v-else
        title="Purchase Request not found"
        back-to="/PIMS/admin/purchase-request"
    />
</template>

<style scoped>
.pr-detail + .pr-detail {
    margin-top: 0.25rem;
}

.pr-detail > [class^='col-'] > .card-title {
    line-height: 1.4;
}

.pr-stat__watermark {
    font-size: 6rem;
    right: 15px;
    top: 65%;
    transform: translateY(-50%);
    opacity: 0.18;
    pointer-events: none;
}

.pr-lock-hint {
    margin-left: 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    opacity: 0.85;
}

.pr-documents__rule {
    margin: 1.25rem 0 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.pr-documents__link {
    text-decoration: underline;
    opacity: 0.85;
    white-space: nowrap;
}

.pr-doc-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
}

.pr-doc {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 1rem;
    background-color: rgba(255, 255, 255, 0.12);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
    color: #fff;
}

.pr-doc.is-uploaded {
    border-color: rgba(45, 206, 137, 0.9);
    background-color: rgba(45, 206, 137, 0.28);
}

.pr-doc.is-missing {
    border-color: rgba(255, 255, 255, 0.75);
    background-color: rgba(251, 99, 64, 0.32);
}

.pr-doc.is-pending {
    opacity: 0.75;
}

/* Decisions on the left, the officer item pages on the right. */
.pr-submit {
    margin-top: 1rem;
}

.pr-submit__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.pr-submit__decisions,
.pr-submit__review {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.pr-submit__notice,
.pr-submit__blocked {
    font-size: 0.75rem;
    line-height: 1.45;
    color: #fff;
    opacity: 0.9;
}

.pr-submit__notice {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.75rem;
    border-left: 2px solid rgba(255, 255, 255, 0.6);
    background-color: rgba(255, 255, 255, 0.12);
    border-radius: 0.25rem;
}

/* Remarks left by approvers */
.pr-remarks {
    margin-top: 1rem;
    padding: 0.625rem 0.875rem;
    border-left: 2px solid rgba(255, 255, 255, 0.6);
    border-radius: 0.25rem;
    background-color: rgba(255, 255, 255, 0.12);
}

.pr-remarks__label {
    margin-bottom: 0.375rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: #fff;
    opacity: 0.8;
}

.pr-remarks__entry {
    font-size: 0.75rem;
    line-height: 1.5;
    color: #fff;
}

.pr-remarks__entry + .pr-remarks__entry {
    margin-top: 0.25rem;
}
</style>
