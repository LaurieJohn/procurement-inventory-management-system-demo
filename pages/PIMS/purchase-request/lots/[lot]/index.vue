<script setup lang="ts">
import { computed, ref } from 'vue'

/** One lot of a Purchase Request, and the items inside it. */
const route = useRoute()
const auth = useAuthStore()
const store = usePurchaseRequestStore()
const ppmp = usePpmpStore()
const modal = usePimsModal()

const lotId = computed(() => Number(route.params.lot))
const lot = computed(() => store.findLot(lotId.value))
/**
 * Reached by URL as easily as by link, so the same visibility rule the listing
 * applies is checked here too. A Purchase Request out of reach reads as not
 * found rather than as forbidden, which keeps its existence private.
 */
const procurement = computed(() => {
    const row = lot.value ? store.find(lot.value.procurement_id) : undefined

    return row && store.canView(row, auth.userId, auth.ppmpRoleId) ? row : undefined
})

const items = computed(() => (lot.value ? store.itemsForLot(lot.value.id) : []))
const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
const itemTotal = computed(() => items.value.reduce((sum, item) => sum + item.total_unit_cost, 0))

const isLocked = computed(() => (procurement.value ? store.isLocked(procurement.value) : false))

/** The item whose details modal is open, if any. */
const viewing = ref<number | null>(null)

const viewedItem = computed(() =>
    viewing.value === null ? null : store.findItem(viewing.value) ?? null,
)

async function confirmDelete(itemId: number): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Delete Item?',
        text: "You won't be able to revert this action.",
        confirmText: 'Delete',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.destroyItem(itemId)
    modal.success('Item deleted successfully')
}
</script>

<template>
    <div v-if="lot && procurement">
        <PageHeader
            title="Purchase Request"
            padding="pb-8"
            :back-to="`/PIMS/purchase-request/${procurement.id}`"
            :crumbs="[
                { to: '/PIMS/purchase-request', icon: true },
                { to: '/PIMS/purchase-request', label: 'Index' },
                { to: `/PIMS/purchase-request/${procurement.id}`, label: procurement.title },
                { label: `Lot ${lot.lot_no} Details` },
            ]"
        />

        <div class="container-fluid mt--8">
            <div v-if="isLocked" class="row">
                <div class="col-12">
                    <div class="alert alert-warning">
                        <strong>
                            <i class="fas fa-lock mr-1"></i>
                            {{ store.statusLabel(procurement.procurement_status_id) }}.
                        </strong>

                        <span class="text-sm">
                            Items in this lot can be viewed but not added, edited or deleted.
                        </span>

                        <NuxtLink
                            :to="`/PIMS/purchase-request/${procurement.id}`"
                            class="alert-link text-sm"
                        >
                            Go to the Purchase Request
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-xl-4 col-md-6">
                    <div class="card card-stats bg-gradient-blue overflow-hidden">
                        <div class="card-body position-relative">
                            <i
                                class="ni ni-ruler-pencil text-white position-absolute lot-stat__watermark"
                                aria-hidden="true"
                            ></i>

                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Number of Items
                                    </h5>
                                    <span class="h1 font-weight-bold mb-0 text-white">
                                        {{ items.length }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="card card-stats bg-gradient-blue overflow-hidden">
                        <div class="card-body position-relative">
                            <i
                                class="ni ni-basket text-white position-absolute lot-stat__watermark"
                                aria-hidden="true"
                            ></i>

                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Total Quantity of Item
                                    </h5>
                                    <span class="h1 font-weight-bold mb-0 text-white">
                                        {{ count(totalQuantity) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="card card-stats bg-gradient-blue overflow-hidden">
                        <div class="card-body position-relative">
                            <i
                                class="ni ni-cart text-white position-absolute lot-stat__watermark"
                                aria-hidden="true"
                            ></i>

                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-0">Total</h5>
                                    <span class="h1 font-weight-bold mb-0 text-white">
                                        {{ peso(itemTotal) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-header border-0">
                            <div class="row">
                                <div class="col-6">
                                    <h3 class="mb-0">List of Items</h3>
                                </div>

                                <div class="col-6 text-right">
                                    <NuxtLink
                                        v-if="!isLocked"
                                        :to="`/PIMS/purchase-request/lots/${lot.id}/items/create`"
                                        class="btn btn-primary btn-round btn-icon"
                                    >
                                        <span class="btn-inner--icon"><i class="fas fa-plus"></i></span>
                                        <span class="btn-inner--text">Add New Item</span>
                                    </NuxtLink>

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
                                        <th><b>Item Name</b></th>
                                        <th><b>Item Description</b></th>
                                        <th><b>Unit</b></th>
                                        <th><b>Quantity</b></th>
                                        <th><b>Unit Cost</b></th>
                                        <th><b>Total Unit Cost</b></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td style="width: 5%">
                                            <button
                                                v-if="isLocked"
                                                type="button"
                                                class="btn btn-primary"
                                                title="View item details"
                                                @click="viewing = item.id"
                                            >
                                                <span class="btn-inner--icon"><i class="fas fa-eye"></i></span>
                                                <span class="btn-inner--text">View</span>
                                            </button>

                                            <AppDropdown v-else>
                                                <template #trigger="{ toggle }">
                                                    <button
                                                        type="button"
                                                        class="btn btn-primary dropdown-toggle"
                                                        @click="toggle"
                                                    >
                                                        Select
                                                    </button>
                                                </template>

                                                <button
                                                    type="button"
                                                    class="dropdown-item"
                                                    @click="viewing = item.id"
                                                >
                                                    <i class="fas fa-eye mr-2"></i>
                                                    View Item
                                                </button>

                                                <NuxtLink
                                                    class="dropdown-item text-primary"
                                                    :to="`/PIMS/purchase-request/items/${item.id}/edit`"
                                                >
                                                    <i class="fas fa-pen text-primary mr-2"></i>
                                                    Edit Item
                                                </NuxtLink>

                                                <button
                                                    type="button"
                                                    class="dropdown-item text-danger"
                                                    @click="confirmDelete(item.id)"
                                                >
                                                    <i class="fas fa-trash mr-2"></i>
                                                    Delete Item
                                                </button>
                                            </AppDropdown>
                                        </td>

                                        <td>
                                            <span class="text-muted">{{ item.item_name }}</span>
                                        </td>

                                        <td style="width: 30%">
                                            <span class="text-muted" style="white-space: pre-line">
                                                {{ item.item_description }}
                                            </span>
                                        </td>

                                        <td>
                                            <span class="text-muted">{{ store.unitName(item.unit_id) }}</span>
                                        </td>

                                        <td>
                                            <span class="text-muted">{{ item.quantity }}</span>
                                        </td>

                                        <td>
                                            <span class="text-muted">{{ peso(item.unit_cost) }}</span>
                                        </td>

                                        <td>
                                            <span class="text-muted">{{ peso(item.total_unit_cost) }}</span>
                                        </td>
                                    </tr>

                                    <tr v-if="items.length === 0">
                                        <td colspan="7" class="text-center bg-light py-4">
                                            <small class="text-muted text-uppercase">
                                                No items in this lot yet.
                                            </small>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Item details -->
        <div
            class="modal fade"
            :class="{ show: viewedItem !== null }"
            :style="{ display: viewedItem !== null ? 'block' : 'none' }"
            tabindex="-1"
            role="dialog"
        >
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div class="modal-content" v-if="viewedItem">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ viewedItem.item_name }}</h5>
                        <button type="button" class="close" @click="viewing = null">
                            <span>&times;</span>
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped mb-0">
                                <tbody>
                                    <tr>
                                        <th style="width: 35%">Item Name</th>
                                        <td>{{ viewedItem.item_name }}</td>
                                    </tr>
                                    <tr>
                                        <th>Corresponding PPMP Project Item</th>
                                        <td>
                                            {{
                                                viewedItem.ppmp_project_item_id
                                                    ? (ppmp.findItem(viewedItem.ppmp_project_item_id)
                                                          ?.title ?? 'Not found')
                                                    : 'Not linked'
                                            }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Item Description</th>
                                        <td style="white-space: pre-line">
                                            {{ viewedItem.item_description }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Unit</th>
                                        <td>{{ store.unitName(viewedItem.unit_id) }}</td>
                                    </tr>
                                    <tr>
                                        <th>Quantity</th>
                                        <td>{{ count(viewedItem.quantity) }}</td>
                                    </tr>
                                    <tr>
                                        <th>Unit Cost</th>
                                        <td>{{ peso(viewedItem.unit_cost) }}</td>
                                    </tr>
                                    <tr>
                                        <th>Total Unit Cost</th>
                                        <td>{{ peso(viewedItem.total_unit_cost) }}</td>
                                    </tr>
                                    <tr>
                                        <th>Supply Officer Remarks</th>
                                        <td>{{ viewedItem.supply_officer_remarks ?? '-' }}</td>
                                    </tr>
                                    <tr>
                                        <th>Budget Officer Remarks</th>
                                        <td>{{ viewedItem.budget_officer_remarks ?? '-' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="viewing = null">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="viewedItem" class="modal-backdrop fade show"></div>
    </div>

    <NotFoundCard v-else title="Lot not found" back-to="/PIMS/purchase-request" />
</template>

<style scoped>
.lot-stat__watermark {
    font-size: 6rem;
    right: 15px;
    top: 65%;
    transform: translateY(-50%);
    opacity: 0.18;
    pointer-events: none;
}
</style>
