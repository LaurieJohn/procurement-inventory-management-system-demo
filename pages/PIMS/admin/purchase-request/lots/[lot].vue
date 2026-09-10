<script setup lang="ts">
import { computed } from 'vue'

/**
 * One lot of a Purchase Request under review.
 *
 * Drilling into a lot stays on the admin side rather than handing the reviewer
 * over to the requester's page.
 */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const store = usePurchaseRequestStore()
const ppmp = usePpmpStore()

const lot = computed(() => store.findLot(Number(route.params.lot)))
const procurement = computed(() => (lot.value ? store.find(lot.value.procurement_id) : undefined))

const items = computed(() => (lot.value ? store.itemsForLot(lot.value.id) : []))
const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
const itemTotal = computed(() => items.value.reduce((sum, item) => sum + item.total_unit_cost, 0))

function ppmpItemTitle(itemId: number | null): string {
    if (itemId === null) {
        return 'Not linked'
    }

    return ppmp.findItem(itemId)?.title ?? 'Not found'
}
</script>

<template>
    <div v-if="lot && procurement">
        <PageHeader
            title="Purchase Request"
            padding="pb-8"
            :back-to="`/PIMS/admin/purchase-request/${procurement.id}`"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/purchase-request', label: 'Index' },
                { to: `/PIMS/admin/purchase-request/${procurement.id}`, label: procurement.title },
                { label: `Lot ${lot.lot_no} Details` },
            ]"
        />

        <div class="container-fluid mt--8">
            <div class="row">
                <div class="col-xl-4 col-md-6">
                    <div class="card card-stats bg-gradient-blue overflow-hidden">
                        <div class="card-body">
                            <h5 class="card-title text-uppercase text-white mb-0">Number of Items</h5>
                            <span class="h1 font-weight-bold mb-0 text-white">{{ items.length }}</span>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="card card-stats bg-gradient-blue overflow-hidden">
                        <div class="card-body">
                            <h5 class="card-title text-uppercase text-white mb-0">
                                Total Quantity of Item
                            </h5>
                            <span class="h1 font-weight-bold mb-0 text-white">
                                {{ count(totalQuantity) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4 col-md-6">
                    <div class="card card-stats bg-gradient-blue overflow-hidden">
                        <div class="card-body">
                            <h5 class="card-title text-uppercase text-white mb-0">Total</h5>
                            <span class="h1 font-weight-bold mb-0 text-white">{{ peso(itemTotal) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-header border-0">
                            <h3 class="mb-0">List of Items</h3>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-items-center table-flush">
                                <thead class="thead-light">
                                    <tr>
                                        <th><b>Item Name</b></th>
                                        <th><b>Item Description</b></th>
                                        <th><b>PPMP Project Item</b></th>
                                        <th><b>Unit</b></th>
                                        <th class="text-right"><b>Quantity</b></th>
                                        <th class="text-right"><b>Unit Cost</b></th>
                                        <th class="text-right"><b>Total Unit Cost</b></th>
                                        <th><b>Officer Remarks</b></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td>{{ item.item_name }}</td>
                                        <td style="white-space: pre-line; max-width: 22rem">
                                            {{ item.item_description }}
                                        </td>
                                        <td>{{ ppmpItemTitle(item.ppmp_project_item_id) }}</td>
                                        <td>{{ store.unitName(item.unit_id) }}</td>
                                        <td class="text-right">{{ count(item.quantity) }}</td>
                                        <td class="text-right">{{ peso(item.unit_cost) }}</td>
                                        <td class="text-right">{{ peso(item.total_unit_cost) }}</td>
                                        <td style="white-space: normal; max-width: 18rem">
                                            <div v-if="item.supply_officer_remarks" class="text-sm">
                                                <b>Supply:</b> {{ item.supply_officer_remarks }}
                                            </div>

                                            <div v-if="item.budget_officer_remarks" class="text-sm">
                                                <b>Budget:</b> {{ item.budget_officer_remarks }}
                                            </div>

                                            <span
                                                v-if="
                                                    !item.supply_officer_remarks &&
                                                    !item.budget_officer_remarks
                                                "
                                                class="text-muted"
                                            >
                                                —
                                            </span>
                                        </td>
                                    </tr>

                                    <tr v-if="items.length === 0">
                                        <td colspan="8" class="text-center bg-light py-4">
                                            <small class="text-muted text-uppercase">
                                                No items in this lot.
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
    </div>

    <NotFoundCard v-else title="Lot not found" back-to="/PIMS/admin/purchase-request" />
</template>
