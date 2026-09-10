<script setup lang="ts">
import { computed, ref } from 'vue'
import { areaOffices, procurementStatuses } from '~/data/reference'
import { PR_STATUS } from '~/stores/purchase-request'

/**
 * Every Purchase Request, as the reviewing offices see it.
 *
 * Supply reviews Purchase Requests; it never raises them, so there is no create
 * action here.
 */
definePageMeta({ layout: 'admin' })

const auth = useAuthStore()
const store = usePurchaseRequestStore()

const statusFilter = ref<number | ''>('')

/**
 * A request only becomes Supply's business once the requesting office has
 * submitted it, so a draft is never listed here. Everything from For
 * Resubmission through Approved stays visible: an administrator needs to see
 * what they returned or denied, not only what is still pending.
 */
const listable = computed(() =>
    store
        .visibleTo(auth.userId, auth.ppmpRoleId)
        .filter((row) => row.procurement_status_id !== PR_STATUS.created),
)

const filtered = computed(() =>
    statusFilter.value === ''
        ? listable.value
        : listable.value.filter((row) => row.procurement_status_id === Number(statusFilter.value)),
)

const page = ref(1)
const perPage = 10

const lastPage = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))

const awaitingAction = computed(
    () =>
        listable.value.filter((row) => row.procurement_status_id === PR_STATUS.submitted).length,
)

/** Created is left out of the filter: nothing in this listing holds it. */
const selectableStatuses = computed(() =>
    procurementStatuses.filter((status) => status.id !== PR_STATUS.created),
)

const statusStyles: Record<string, { badge: string; icon: string }> = {
    Created: { badge: 'badge-secondary', icon: 'fas fa-pen-fancy' },
    'Submitted for Approval': { badge: 'badge-warning', icon: 'fas fa-paper-plane' },
    'For Resubmission': { badge: 'badge-warning', icon: 'fas fa-undo' },
    Denied: { badge: 'badge-danger', icon: 'fas fa-times-circle' },
    Closed: { badge: 'badge-dark', icon: 'fas fa-archive' },
    Approved: { badge: 'badge-success', icon: 'fas fa-check-circle' },
}

const approvalStageStyle = { badge: 'badge-info', icon: 'fas fa-clipboard-check' }

function styleFor(label: string): { badge: string; icon: string } {
    if (statusStyles[label]) {
        return statusStyles[label]
    }

    return label.startsWith('For Approval')
        ? approvalStageStyle
        : { badge: 'badge-light', icon: 'fas fa-question-circle' }
}

/**
 * The office a request came from, taken from the head who signed it — the
 * requester's own office is what `request_by` names.
 */
function officeFor(requestBy: string): string {
    const office = areaOffices.find(
        (candidate) => candidate.area_office_head.toUpperCase() === requestBy.toUpperCase(),
    )

    return office?.abbreviation ?? '—'
}

function showAwaiting(): void {
    statusFilter.value = PR_STATUS.submitted
    page.value = 1
}
</script>

<template>
    <div>
        <PageHeader
            title="Purchase Request"
            :crumbs="[{ to: '/PIMS/admin', icon: true }, { label: 'Index' }]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-header border-0">
                            <div class="row align-items-center">
                                <div class="col-md-6">
                                    <h3 class="mb-0">List of Submitted Purchase Requests</h3>

                                    <p class="text-sm text-muted mb-0">
                                        {{ filtered.length }} {{ plural('request', filtered.length) }}
                                        {{ statusFilter === '' ? 'in total' : 'matching this filter' }}

                                        <template v-if="awaitingAction > 0">
                                            &middot;
                                            <a
                                                href="#"
                                                class="text-warning font-weight-bold"
                                                @click.prevent="showAwaiting"
                                            >
                                                {{ awaitingAction }}
                                                {{ plural('request', awaitingAction) }} awaiting a decision
                                            </a>
                                        </template>
                                    </p>
                                </div>

                                <div class="col-md-6 text-md-right mt-3 mt-md-0">
                                    <form class="form-inline justify-content-md-end" @submit.prevent>
                                        <label class="mr-2 text-sm text-muted" for="status">Status</label>

                                        <select
                                            id="status"
                                            v-model="statusFilter"
                                            class="form-control form-control-sm"
                                            @change="page = 1"
                                        >
                                            <option value="">All statuses</option>
                                            <option
                                                v-for="status in selectableStatuses"
                                                :key="status.id"
                                                :value="status.id"
                                            >
                                                {{ status.type }}
                                            </option>
                                        </select>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-items-center table-flush table-hover">
                                <thead class="thead-light">
                                    <tr>
                                        <th scope="col">Actions</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Title</th>
                                        <th scope="col">Division/Field Office</th>
                                        <th scope="col">PR Type</th>
                                        <th scope="col">Mode of Procurement</th>
                                        <th scope="col">Totals</th>
                                        <th scope="col">Created by</th>
                                    </tr>
                                </thead>

                                <tbody class="list">
                                    <tr v-for="procurement in paged" :key="procurement.id">
                                        <td>
                                            <AppDropdown wrapper-class="btn-group">
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
                                                    :to="`/PIMS/admin/purchase-request/${procurement.id}`"
                                                >
                                                    <i class="fas fa-folder-open text-primary mr-2"></i>
                                                    Review
                                                </NuxtLink>

                                                <NuxtLink
                                                    class="dropdown-item"
                                                    :to="`/PIMS/admin/purchase-request/${procurement.id}/attachments`"
                                                >
                                                    <i class="fas fa-paperclip text-primary mr-2"></i>
                                                    View Documents
                                                </NuxtLink>
                                            </AppDropdown>
                                        </td>

                                        <td>
                                            <span
                                                class="badge badge-lg pr-index__status"
                                                :class="
                                                    styleFor(
                                                        store.statusLabel(
                                                            procurement.procurement_status_id,
                                                        ),
                                                    ).badge
                                                "
                                            >
                                                <i
                                                    class="mr-1"
                                                    :class="
                                                        styleFor(
                                                            store.statusLabel(
                                                                procurement.procurement_status_id,
                                                            ),
                                                        ).icon
                                                    "
                                                ></i>
                                                {{ store.statusLabel(procurement.procurement_status_id) }}
                                            </span>

                                            <div
                                                v-if="store.pendingWith(procurement)"
                                                class="text-muted pr-index__pending"
                                            >
                                                <i class="fas fa-user-clock mr-1"></i>
                                                Pending with {{ store.pendingWith(procurement) }}
                                            </div>
                                        </td>

                                        <th scope="row">
                                            <div class="media align-items-center">
                                                <div class="media-body">
                                                    <NuxtLink
                                                        :to="`/PIMS/admin/purchase-request/${procurement.id}`"
                                                        class="pr-index__title"
                                                    >
                                                        {{ procurement.title }}
                                                    </NuxtLink>

                                                    <p
                                                        v-if="procurement.description"
                                                        class="text-muted pr-index__description"
                                                    >
                                                        {{ procurement.description }}
                                                    </p>

                                                    <span class="text-muted pr-index__meta">
                                                        <i class="far fa-calendar-alt mr-1"></i>
                                                        {{ longDate(procurement.date) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </th>

                                        <td>
                                            <span class="text-sm">
                                                {{ officeFor(procurement.request_by) }}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                v-if="store.prTypeName(procurement.pr_type_id)"
                                                class="badge badge-dot"
                                            >
                                                <i class="bg-primary"></i>
                                                <span class="pr-index__tag">
                                                    {{ store.prTypeName(procurement.pr_type_id) }}
                                                </span>
                                            </span>
                                            <span v-else class="text-muted text-sm">Not set</span>
                                        </td>

                                        <td>
                                            <span
                                                v-if="
                                                    store.modeProcurementName(
                                                        procurement.mode_of_procurement_id,
                                                    )
                                                "
                                                class="badge badge-dot"
                                            >
                                                <i class="bg-info"></i>
                                                <span class="pr-index__tag">
                                                    {{
                                                        store.modeProcurementName(
                                                            procurement.mode_of_procurement_id,
                                                        )
                                                    }}
                                                </span>
                                            </span>
                                            <span v-else class="text-muted text-sm">Not set</span>
                                        </td>

                                        <td>
                                            <div class="pr-index__metrics">
                                                <span class="pr-index__metric">
                                                    <i class="fas fa-layer-group"></i>
                                                    {{ store.lotsFor(procurement.id).length }}
                                                    {{ plural('lot', store.lotsFor(procurement.id).length) }}
                                                </span>

                                                <span class="pr-index__metric">
                                                    <i class="fas fa-boxes"></i>
                                                    {{ store.itemCountFor(procurement.id) }}
                                                    {{ plural('item', store.itemCountFor(procurement.id)) }}
                                                </span>

                                                <span class="pr-index__amount">
                                                    {{ peso(store.totalFor(procurement.id)) }}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span class="text-sm">
                                                {{ store.userName(procurement.user_id) }}
                                            </span>
                                        </td>
                                    </tr>

                                    <tr v-if="paged.length === 0">
                                        <td colspan="8" class="text-center pr-index__empty">
                                            <i
                                                class="ni ni-box-2 text-muted"
                                                style="font-size: 3rem; opacity: 0.35"
                                                aria-hidden="true"
                                            ></i>
                                            <h4 class="text-muted mt-3 mb-1">
                                                No Purchase Requests to review
                                            </h4>
                                            <p class="text-sm text-muted mb-0">
                                                Nothing matches the current status filter.
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <AppPagination v-model="page" :last-page="lastPage" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pr-index__title {
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: normal;
    max-width: 22rem;
    display: inline-block;
}

.pr-index__description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 0;
    max-width: 22rem;
    font-size: 0.75rem;
    line-height: 1.4;
    white-space: normal;
}

.pr-index__meta {
    font-size: 0.6875rem;
    line-height: 1.35;
    white-space: normal;
}

.pr-index__status {
    white-space: nowrap;
}

.pr-index__pending {
    margin-top: 0.25rem;
    font-size: 0.6875rem;
    line-height: 1.35;
}

.pr-index__tag {
    display: inline-block;
    max-width: 14rem;
    font-size: 0.75rem;
    line-height: 1.35;
    white-space: normal;
}

.pr-index__metrics {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.pr-index__metric {
    font-size: 0.75rem;
    line-height: 1.35;
    color: #8898aa;
}

.pr-index__metric i {
    width: 0.875rem;
    margin-right: 0.25rem;
    text-align: center;
}

.pr-index__amount {
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1.35;
    color: #32325d;
}

.pr-index__empty {
    padding: 3rem 1.5rem;
}
</style>
