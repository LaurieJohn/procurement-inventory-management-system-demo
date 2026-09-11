<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * The Purchase Request listing.
 *
 * Status is deliberately the second column so the state of every request reads
 * at a glance, without scanning to the end of the row.
 */
const auth = useAuthStore()
const store = usePurchaseRequestStore()
const modal = usePimsModal()

/**
 * An Employee sees only their own Purchase Requests and a Unit Head only their
 * Unit's; the reviewing offices see all of them.
 */
const visible = computed(() => store.visibleTo(auth.userId, auth.ppmpRoleId))

const page = ref(1)
const perPage = 10

const lastPage = computed(() => Math.max(1, Math.ceil(visible.value.length / perPage)))

const paged = computed(() => visible.value.slice((page.value - 1) * perPage, page.value * perPage))

/**
 * Each procurement status gets its own colour and icon so the column can be read
 * without stopping to parse the word.
 */
const statusStyles: Record<string, { badge: string; icon: string }> = {
    Created: { badge: 'badge-secondary', icon: 'fas fa-pen-fancy' },
    'Submitted for Approval': { badge: 'badge-warning', icon: 'fas fa-paper-plane' },
    'For Resubmission': { badge: 'badge-warning', icon: 'fas fa-undo' },
    Denied: { badge: 'badge-danger', icon: 'fas fa-times-circle' },
    Closed: { badge: 'badge-dark', icon: 'fas fa-archive' },
    Approved: { badge: 'badge-success', icon: 'fas fa-check-circle' },
}

/** Every "For Approval (…)" stage shares one look. */
const approvalStageStyle = { badge: 'badge-info', icon: 'fas fa-clipboard-check' }

function styleFor(label: string): { badge: string; icon: string } {
    if (statusStyles[label]) {
        return statusStyles[label]
    }

    return label.startsWith('For Approval')
        ? approvalStageStyle
        : { badge: 'badge-light', icon: 'fas fa-question-circle' }
}

async function confirmDelete(id: number): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Delete Purchase Request?',
        text: "You won't be able to revert this action.",
        confirmText: 'Delete',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.destroy(id)
    modal.success('Purchase Request deleted successfully')

    if (page.value > lastPage.value) {
        page.value = lastPage.value
    }
}
</script>

<template>
    <div>
        <PageHeader
            title="Purchase Request"
            :crumbs="[{ to: '/PIMS/purchase-request', icon: true }, { label: 'Index' }]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-header border-0">
                            <div class="row align-items-center">
                                <div class="col-12 col-md-8">
                                    <h3 class="mb-0">List of Purchase Requests</h3>
                                    <p class="text-sm text-muted mb-0">
                                        {{ visible.length }}
                                        {{ plural('request', visible.length) }} in total
                                    </p>
                                </div>

                                <div class="col-12 col-md-4 text-md-right mt-3 mt-md-0">
                                    <NuxtLink
                                        to="/PIMS/purchase-request/create"
                                        class="btn btn-primary btn-round btn-icon"
                                    >
                                        <span class="btn-inner--icon"><i class="fas fa-plus"></i></span>
                                        <span class="btn-inner--text">Create Purchase Request</span>
                                    </NuxtLink>
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
                                        <th scope="col">PR Type</th>
                                        <th scope="col">Mode of Procurement</th>
                                        <th scope="col">Totals</th>
                                        <th scope="col">Requested by</th>
                                        <th scope="col">Approved by</th>
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
                                                    :to="`/PIMS/purchase-request/${procurement.id}`"
                                                >
                                                    <i class="fas fa-folder-open text-primary mr-2"></i>
                                                    Open
                                                </NuxtLink>

                                                <NuxtLink
                                                    class="dropdown-item"
                                                    :to="`/PIMS/purchase-request/${procurement.id}/edit`"
                                                >
                                                    <i class="fas fa-pen text-primary mr-2"></i>
                                                    Edit Details
                                                </NuxtLink>

                                                <NuxtLink
                                                    class="dropdown-item"
                                                    :to="`/PIMS/purchase-request/${procurement.id}/attachments`"
                                                >
                                                    <i class="fas fa-paperclip text-primary mr-2"></i>
                                                    Documents
                                                </NuxtLink>

                                                <div class="dropdown-divider"></div>

                                                <button
                                                    type="button"
                                                    class="dropdown-item text-danger"
                                                    @click="confirmDelete(procurement.id)"
                                                >
                                                    <i class="fas fa-trash mr-2"></i>
                                                    Delete
                                                </button>
                                            </AppDropdown>
                                        </td>

                                        <!-- Status -->
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

                                            <!-- Submitted for Approval does not name the office
                                                 holding it; that depends on the PR Type. -->
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
                                                        :to="`/PIMS/purchase-request/${procurement.id}`"
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

                                                    <span v-if="procurement.date" class="text-muted pr-index__meta">
                                                        <i class="far fa-calendar-alt mr-1"></i>
                                                        {{ longDate(procurement.date) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </th>

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
                                                v-if="store.modeProcurementName(procurement.mode_of_procurement_id)"
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

                                        <td class="budget">
                                            <span class="text-sm">{{ procurement.request_by }}</span>
                                        </td>

                                        <td class="budget">
                                            <span class="text-sm">{{ procurement.approved_by }}</span>
                                        </td>
                                    </tr>

                                    <tr v-if="paged.length === 0">
                                        <td colspan="8" class="text-center pr-index__empty">
                                            <i
                                                class="ni ni-box-2 text-muted"
                                                style="font-size: 3rem; opacity: 0.35"
                                                aria-hidden="true"
                                            ></i>
                                            <h4 class="text-muted mt-3 mb-1">No Purchase Requests yet</h4>
                                            <p class="text-sm text-muted mb-3">
                                                Create your first Purchase Request to get started.
                                            </p>
                                            <NuxtLink
                                                to="/PIMS/purchase-request/create"
                                                class="btn btn-sm btn-primary"
                                            >
                                                Create Purchase Request
                                            </NuxtLink>
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
/* Argon's flush tables set cells to nowrap, so anything that should wrap has to
   opt back in explicitly. */
.pr-index__title {
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: normal;
    /* The table scrolls sideways on a narrow screen, so the title column is
       given room rather than being compressed into a column of single words. */
    min-width: 13rem;
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
    white-space: nowrap;
}

.pr-index__tag {
    display: inline-block;
    max-width: 14rem;
    font-size: 0.75rem;
    line-height: 1.35;
    white-space: normal;
}

/* Totals cell: one metric per line, amount emphasised last. */
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
