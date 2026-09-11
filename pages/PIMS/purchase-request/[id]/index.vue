<script setup lang="ts">
import { computed } from 'vue'

/**
 * One Purchase Request: its details, the documents it owes, the submit/reopen
 * controls, and the lots it is broken into.
 */
const route = useRoute()
const auth = useAuthStore()
const store = usePurchaseRequestStore()
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

const isLocked = computed(() => (procurement.value ? store.isLocked(procurement.value) : false))
const isForResubmission = computed(() =>
    procurement.value ? store.isForResubmission(procurement.value) : false,
)

/**
 * A requester may pull their own submission back only while it is still merely
 * Submitted for Approval and nobody has picked it up.
 */
const canRevert = computed(() =>
    procurement.value ? store.isSubmitted(procurement.value) : false,
)

const canSubmit = computed(() => (procurement.value ? store.canSubmit(procurement.value) : false))

const documents = computed(() => (procurement.value ? store.documentList(procurement.value) : []))
const requiredDocuments = computed(() => documents.value.filter((document) => document.required))
const requiredUploaded = computed(() => requiredDocuments.value.filter((doc) => doc.stored).length)
const missingRequired = computed(() => requiredDocuments.value.length - requiredUploaded.value)
const missingRequiredDocuments = computed(() =>
    procurement.value ? store.missingRequiredDocuments(procurement.value) : [],
)

const stageRemarks = computed(() =>
    procurement.value ? store.stageRemarks(procurement.value) : [],
)

const lots = computed(() => (procurement.value ? store.lotsFor(procurement.value.id) : []))
const overallItems = computed(() => (procurement.value ? store.itemCountFor(procurement.value.id) : 0))
const overallTotal = computed(() => (procurement.value ? store.totalFor(procurement.value.id) : 0))
const overallQuantity = computed(() =>
    lots.value.reduce(
        (total, lot) => total + store.itemsForLot(lot.id).reduce((sum, item) => sum + item.quantity, 0),
        0,
    ),
)

const submitLabel = computed(() =>
    isForResubmission.value ? 'Resubmit for Approval' : 'Submit for Approval',
)

const blockedReason = computed(() => {
    if (!procurement.value) {
        return ''
    }

    if (procurement.value.pr_type_id === null) {
        return 'Set a PR Type on this request before it can be submitted.'
    }

    const count = missingRequiredDocuments.value.length

    return `${count} ${count === 1 ? 'required document is' : 'required documents are'} still missing: ${missingRequiredDocuments.value.join(', ')}.`
})

const statusBadge = computed(() => {
    const statusId = Number(procurement.value?.procurement_status_id)

    if (statusId === 11) return 'badge-success'
    if (statusId === 3) return 'badge-danger'
    if (statusId === 2) return 'badge-warning'
    if (statusId === 4) return 'badge-dark'
    if (statusId >= 5) return 'badge-info'

    return 'badge-secondary'
})

/* ----- Actions ----- */

async function addLot(): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Are you sure?',
        text: 'Items grouped together to form several lots in a single Purchase Request (PR) shall be evaluated and awarded as separate contracts. Are you sure you want to proceed with this action?',
        confirmText: 'Add Lot',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.addLot(id.value)
    modal.success('Lot added successfully')
}

async function submit(): Promise<void> {
    const confirmed = await modal.confirm({
        title: `${submitLabel.value}?`,
        text: 'All required documents are uploaded. Once submitted, this Purchase Request — including its lots, items and documents — can no longer be edited unless you reopen this PR again.',
        confirmText: submitLabel.value,
        variant: 'success',
    })

    if (!confirmed) {
        return
    }

    store.submit(id.value)
    modal.success('Purchase Request submitted for approval')
}

async function revert(): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Reopen this Purchase Request?',
        text: 'This Purchase Request will be pulled back from approval and become editable again. You will need to submit it once more when you are done.',
        confirmText: 'Reopen',
        variant: 'success',
    })

    if (!confirmed) {
        return
    }

    store.revert(id.value)
    modal.success('Purchase Request reopened')
}

/**
 * The last lot is cleared rather than deleted, and a lot holding items cannot
 * be removed at all.
 */
async function confirmDeleteLot(lotId: number): Promise<void> {
    if (lots.value.length > 1) {
        const confirmed = await modal.confirm({
            title: 'Delete Lot?',
            text: 'This will permanently delete the selected Lot and all related items!',
            confirmText: 'Delete',
            variant: 'danger',
        })

        if (!confirmed) {
            return
        }

        if (store.destroyLot(lotId) === 'blocked') {
            await modal.notice({
                title: 'Lot Deletion Unsuccessful',
                text: 'This Lot cannot be deleted since there are active items in it.',
            })

            return
        }

        modal.success('Lot Deleted Successfully')

        return
    }

    const confirmed = await modal.confirm({
        title: 'The last Lot cannot be deleted',
        text: 'This Lot will only be cleared instead of being deleted. Are you sure you want to proceed?',
        confirmText: 'Clear Lot',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.clearLot(lotId)
    modal.success('Lot Cleared Successfully')
}

async function printOrDownload(): Promise<void> {
    await modal.notice({
        title: 'Purchase Request Form',
        text: 'Generating the Purchase Request Form needs the PDF service, which this front-end demo does not carry.',
    })
}

/** Per-lot figures the table prints beside the lot number. */
function lotStats(lotId: number) {
    const items = store.itemsForLot(lotId)
    const totalCost = items.reduce((sum, item) => sum + item.total_unit_cost, 0)
    const units = [...new Set(items.map((item) => store.unitName(item.unit_id)).filter(Boolean))]

    return {
        items,
        itemCount: items.length,
        totalCost,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        units,
        // A summed quantity only means something when every item shares a unit.
        costShare: overallTotal.value > 0 ? Math.round((totalCost / overallTotal.value) * 100) : 0,
        linkedToPpmp: items.filter((item) => item.ppmp_project_item_id !== null).length,
        preview: items
            .slice(0, 3)
            .map((item) => item.item_name)
            .join(', '),
    }
}
</script>

<template>
    <div v-if="procurement">
        <PageHeader
            title="Purchase Request"
            back-to="/PIMS/purchase-request"
            :crumbs="[
                { to: '/PIMS/purchase-request', icon: true },
                { to: '/PIMS/purchase-request', label: 'Index' },
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

                            <div class="row">
                                <div class="col-sm-11">
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
                                            <h4 class="card-title text-white mb-0">Date Created:</h4>
                                        </div>
                                        <div class="col-sm-8">
                                            <h3 class="card-title text-white mb-0">
                                                {{ longDate(procurement.created_at) }}
                                            </h3>
                                        </div>
                                    </div>

                                    <div class="row pr-detail">
                                        <div class="col-sm-4">
                                            <h4 class="card-title text-white mb-0">
                                                Date of Procurement:
                                            </h4>
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

                                            <span v-if="isLocked" class="text-white pr-lock-hint">
                                                <i class="fas fa-lock"></i> Locked for editing
                                            </span>
                                        </div>
                                    </div>

                                    <div class="row pr-detail">
                                        <div class="col-sm-4">
                                            <h4 class="card-title text-white mb-0">
                                                Title and Description:
                                            </h4>
                                        </div>
                                        <div class="col-sm-8">
                                            <h5 class="card-title text-uppercase text-white mb-0">
                                                {{ procurement.title }}
                                            </h5>

                                            <p class="mb-0 text-sm text-white">
                                                {{ procurement.description }}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-sm-1">
                                    <span
                                        v-if="isLocked"
                                        class="icon icon-shape bg-white text-muted rounded-circle shadow btn-icon-clipboard pr-action-disabled"
                                        :title="`Editing is locked while this Purchase Request is ${store.statusLabel(procurement.procurement_status_id)}`"
                                    >
                                        <i class="fas fa-lock"></i>
                                    </span>

                                    <NuxtLink
                                        v-else
                                        :to="`/PIMS/purchase-request/${procurement.id}/edit`"
                                        class="icon icon-shape bg-white text-dark rounded-circle shadow btn-icon-clipboard"
                                        title="Edit Details"
                                    >
                                        <i class="fas fa-pencil-alt"></i>
                                    </NuxtLink>

                                    <AppDropdown wrapper-class="dropdown mt-2" align-right>
                                        <template #trigger="{ toggle }">
                                            <a
                                                href="#"
                                                class="icon icon-shape bg-white text-dark rounded-circle shadow btn-icon-clipboard"
                                                title="More Actions"
                                                style="text-decoration: none"
                                                @click.prevent="toggle"
                                            >
                                                <i class="fas fa-chevron-down"></i>
                                            </a>
                                        </template>

                                        <a href="#" class="dropdown-item" @click.prevent="printOrDownload">
                                            <i class="fas fa-file-pdf text-danger mr-2"></i>
                                            Download PDF
                                        </a>

                                        <a href="#" class="dropdown-item" @click.prevent="printOrDownload">
                                            <i class="fas fa-print text-dark mr-2"></i>
                                            Print Purchase Request
                                        </a>
                                    </AppDropdown>
                                </div>
                            </div>

                            <!-- Required documents -->
                            <div class="row pr-documents">
                                <div class="col-12">
                                    <hr class="pr-documents__rule" />

                                    <div class="d-flex align-items-center flex-wrap mb-2">
                                        <h4 class="card-title text-white mb-0 mr-2">
                                            Required Documents:
                                        </h4>

                                        <span
                                            v-if="requiredDocuments.length > 0"
                                            class="badge badge-lg"
                                            :class="missingRequired === 0 ? 'badge-success' : 'badge-warning'"
                                        >
                                            {{ requiredUploaded }} of {{ requiredDocuments.length }} uploaded
                                        </span>

                                        <NuxtLink
                                            :to="`/PIMS/purchase-request/${procurement.id}/attachments`"
                                            class="text-white text-sm ml-auto pr-documents__link"
                                        >
                                            <i class="fas mr-1" :class="isLocked ? 'fa-eye' : 'fa-upload'"></i>
                                            {{ isLocked ? 'View Documents' : 'Upload Documents' }}
                                        </NuxtLink>
                                    </div>

                                    <p
                                        v-if="procurement.pr_type_id === null"
                                        class="text-sm text-white mb-0 pr-documents__note"
                                    >
                                        <i class="fas fa-exclamation-triangle mr-1"></i>
                                        Set a PR Type on this request to see the documents it requires.
                                    </p>

                                    <template v-else>
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
                                                :title="`${document.required ? 'Required' : 'Optional'}${document.applicable ? '' : ' — not required for this PR type'}`"
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

                                                <b v-if="document.required" class="pr-doc__flag">*</b>
                                            </span>
                                        </div>

                                        <p
                                            v-if="requiredDocuments.length > 0"
                                            class="text-white mb-0 mt-2 pr-documents__note"
                                        >
                                            <b>*</b> required before this Purchase Request can be
                                            submitted to Supply.
                                        </p>
                                    </template>

                                    <!-- Why an approver sent this back -->
                                    <div v-if="stageRemarks.length" class="pr-remarks">
                                        <div class="pr-remarks__label">
                                            <i class="fas fa-comment-dots mr-1"></i>
                                            Remarks from the approvers
                                        </div>

                                        <div
                                            v-for="entry in stageRemarks"
                                            :key="entry.office"
                                            class="pr-remarks__entry"
                                        >
                                            <b>{{ entry.office }}:</b> {{ entry.remark }}
                                        </div>
                                    </div>

                                    <!-- Submit / Reopen -->
                                    <div class="pr-submit">
                                        <template v-if="isLocked">
                                            <div class="pr-submit__notice">
                                                <i class="fas fa-lock mr-1"></i>
                                                <b>
                                                    {{
                                                        store.statusLabel(
                                                            procurement.procurement_status_id,
                                                        )
                                                    }}.
                                                </b>
                                                This Purchase Request, its lots, its items and its
                                                documents can no longer be changed.
                                                <template v-if="canRevert">
                                                    Reopen this PR if you still need to make
                                                    corrections.
                                                </template>
                                            </div>

                                            <button
                                                v-if="canRevert"
                                                type="button"
                                                class="btn btn-white"
                                                @click="revert"
                                            >
                                                <i class="fas fa-undo mr-1"></i> Reopen
                                            </button>
                                        </template>

                                        <template v-else>
                                            <div v-if="isForResubmission" class="pr-submit__notice">
                                                <i class="fas fa-undo mr-1"></i>
                                                <b>Returned for resubmission.</b>
                                                You can edit the details, lots and items again, and
                                                reupload or remove documents. Address the remarks
                                                above, then resubmit it for approval.
                                            </div>

                                            <button
                                                v-if="canSubmit"
                                                type="button"
                                                class="btn btn-white"
                                                @click="submit"
                                            >
                                                <i class="fas fa-paper-plane mr-1"></i>
                                                {{ submitLabel }}
                                            </button>

                                            <template v-else>
                                                <br />
                                                <button
                                                    type="button"
                                                    class="btn btn-white pr-action-disabled"
                                                    disabled
                                                >
                                                    <i class="fas fa-paper-plane mr-1"></i>
                                                    {{ submitLabel }}
                                                </button>

                                                <div class="pr-submit__blocked">
                                                    <i class="fas fa-exclamation-circle mr-1"></i>
                                                    {{ blockedReason }}
                                                </div>
                                            </template>
                                        </template>
                                    </div>
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
                                        class="ni ni-briefcase-24 text-white position-absolute pr-stat__watermark"
                                        aria-hidden="true"
                                    ></i>

                                    <div class="row">
                                        <div class="col">
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
                            </div>
                        </div>

                        <div class="col-xl-12 col-md-6">
                            <div class="card card-stats bg-gradient-blue">
                                <div class="card-body position-relative">
                                    <i
                                        class="ni ni-tag text-white position-absolute pr-stat__watermark"
                                        aria-hidden="true"
                                    ></i>

                                    <div class="row">
                                        <div class="col">
                                            <h5 class="card-title text-uppercase text-white mb-0">
                                                PR Type
                                            </h5>
                                            <span class="h2 font-weight-bold mb-0 text-white">
                                                {{ store.prTypeName(procurement.pr_type_id) ?? 'N/A' }}
                                            </span>
                                        </div>
                                    </div>
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

                                    <div class="row">
                                        <div class="col">
                                            <h5 class="card-title text-uppercase text-white mb-0">
                                                Total number of items
                                            </h5>
                                            <span class="h1 font-weight-bold mb-0 text-white">
                                                {{ overallItems }}
                                            </span>
                                        </div>
                                    </div>
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

                                    <div class="row">
                                        <div class="col">
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
                </div>
            </div>

            <!-- Lots -->
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-header border-0">
                            <div class="row">
                                <div class="col-12 col-sm-6">
                                    <h3 class="mb-0">List of Lots</h3>
                                </div>

                                <div class="col-12 col-sm-6 text-sm-right mt-3 mt-sm-0">
                                    <button
                                        v-if="!isLocked"
                                        type="button"
                                        class="btn btn-primary btn-round btn-icon"
                                        @click="addLot"
                                    >
                                        <span class="btn-inner--icon"><i class="fas fa-plus"></i></span>
                                        <span class="btn-inner--text">Add New Lot</span>
                                    </button>

                                    <span v-else class="text-muted text-sm">
                                        <i class="fas fa-lock mr-1"></i>
                                        Locked &mdash;
                                        {{ store.statusLabel(procurement.procurement_status_id) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-items-center table-flush table-hover">
                                <thead class="thead-light">
                                    <tr>
                                        <th><b>Actions</b></th>
                                        <th><b>Lot Number</b></th>
                                        <th><b>Number of Items</b></th>
                                        <th><b>Total Quantity</b></th>
                                        <th><b>Total Cost</b></th>
                                        <th><b>Date Created</b></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="lot in lots" :key="lot.id">
                                        <td style="width: 5%">
                                            <AppDropdown>
                                                <template #trigger="{ toggle }">
                                                    <button
                                                        type="button"
                                                        class="btn btn-primary dropdown-toggle"
                                                        @click="toggle"
                                                    >
                                                        Select
                                                    </button>
                                                </template>

                                                <NuxtLink
                                                    class="dropdown-item"
                                                    :to="`/PIMS/purchase-request/lots/${lot.id}`"
                                                >
                                                    View Lot
                                                </NuxtLink>

                                                <button
                                                    v-if="!isLocked"
                                                    type="button"
                                                    class="dropdown-item text-danger"
                                                    @click="confirmDeleteLot(lot.id)"
                                                >
                                                    Delete Lot
                                                </button>
                                            </AppDropdown>
                                        </td>

                                        <td class="table-user">
                                            <b>{{ lot.lot_no }}</b>

                                            <span
                                                v-if="lotStats(lot.id).itemCount === 0"
                                                class="badge badge-dot ml-1"
                                            >
                                                <i class="bg-warning"></i>
                                                <span class="text-muted lot-note">Empty</span>
                                            </span>
                                        </td>

                                        <td>
                                            <span class="text-muted">{{ lotStats(lot.id).itemCount }}</span>

                                            <template v-if="lotStats(lot.id).itemCount > 0">
                                                <div class="lot-note text-muted">
                                                    {{ lotStats(lot.id).preview
                                                    }}<template v-if="lotStats(lot.id).itemCount > 3">
                                                        &hellip; +{{ lotStats(lot.id).itemCount - 3 }} more
                                                    </template>
                                                </div>

                                                <div
                                                    class="lot-note"
                                                    :class="
                                                        lotStats(lot.id).linkedToPpmp ===
                                                        lotStats(lot.id).itemCount
                                                            ? 'text-success'
                                                            : 'text-warning'
                                                    "
                                                >
                                                    <i class="fas fa-link"></i>
                                                    {{ lotStats(lot.id).linkedToPpmp }} of
                                                    {{ lotStats(lot.id).itemCount }} linked to PPMP
                                                </div>
                                            </template>

                                            <div v-else class="lot-note text-muted">
                                                No items added yet
                                            </div>
                                        </td>

                                        <td>
                                            <span class="text-muted">
                                                {{ count(lotStats(lot.id).totalQuantity) }}
                                            </span>

                                            <div
                                                v-if="lotStats(lot.id).units.length === 1"
                                                class="lot-note text-muted"
                                            >
                                                {{ lotStats(lot.id).units[0] }}
                                            </div>

                                            <div
                                                v-else-if="lotStats(lot.id).units.length > 1"
                                                class="lot-note text-muted"
                                                :title="lotStats(lot.id).units.join(', ')"
                                            >
                                                {{ lotStats(lot.id).units.length }} units of measure
                                            </div>
                                        </td>

                                        <td>
                                            <span class="text-muted">
                                                {{ peso(lotStats(lot.id).totalCost) }}
                                            </span>

                                            <template v-if="lotStats(lot.id).totalCost > 0">
                                                <div class="progress progress-xs mt-1 mb-1 lot-share">
                                                    <div
                                                        class="progress-bar bg-primary"
                                                        role="progressbar"
                                                        :style="{ width: `${lotStats(lot.id).costShare}%` }"
                                                    ></div>
                                                </div>

                                                <div class="lot-note text-muted">
                                                    {{ lotStats(lot.id).costShare }}% of this PR
                                                </div>
                                            </template>
                                        </td>

                                        <td>
                                            <span class="text-muted">
                                                {{ longDateTime(lot.created_at) }}
                                            </span>

                                            <div
                                                v-if="lot.updated_at > lot.created_at"
                                                class="lot-note text-muted"
                                            >
                                                Updated {{ forHumans(lot.updated_at) }}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>

                                <tfoot v-if="lots.length > 0" class="thead-light">
                                    <tr>
                                        <th></th>
                                        <th>
                                            <b>{{ lots.length }} {{ plural('Lot', lots.length) }}</b>
                                        </th>
                                        <th>
                                            <b>{{ overallItems }} {{ plural('item', overallItems) }}</b>
                                        </th>
                                        <th>
                                            <b>{{ count(overallQuantity) }}</b>
                                        </th>
                                        <th>
                                            <b>{{ peso(overallTotal) }}</b>
                                        </th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Purchase Request not found" back-to="/PIMS/purchase-request" />
</template>

<style scoped>
/* Label/value pairs in the summary card */
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

/* Required-documents strip inside the summary card */
.pr-documents__rule {
    margin: 1.25rem 0 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.pr-documents__link {
    text-decoration: underline;
    opacity: 0.85;
    white-space: nowrap;
}

.pr-documents__link:hover {
    color: #fff;
    opacity: 1;
}

.pr-documents__note {
    font-size: 0.75rem;
    opacity: 0.85;
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

.pr-doc__flag {
    margin-left: -0.125rem;
}

/* Secondary lines inside the lots table cells */
.lot-note {
    font-size: 0.6875rem;
    line-height: 1.35;
    max-width: 16rem;
    white-space: normal;
}

.lot-share {
    max-width: 7rem;
}

/* Submit / revert workflow inside the summary card */
.pr-lock-hint {
    margin-left: 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    opacity: 0.85;
}

.pr-action-disabled {
    cursor: not-allowed;
    opacity: 0.65;
}

.pr-submit {
    margin-top: 1rem;
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

.pr-submit__blocked {
    margin-top: 0.5rem;
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
