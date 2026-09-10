<script setup lang="ts">
import { computed } from 'vue'

/** Edit an item inside a lot. */
const route = useRoute()
const auth = useAuthStore()
const store = usePurchaseRequestStore()
const ppmp = usePpmpStore()
const modal = usePimsModal()

const item = computed(() => store.findItem(Number(route.params.item)))
const lot = computed(() => (item.value ? store.findLot(item.value.lot_id) : undefined))
/**
 * Reached by URL as easily as by link, so the same visibility rule the listing
 * applies is checked here too. A Purchase Request out of reach reads as not
 * found rather than as forbidden, which keeps its existence private.
 */
const procurement = computed(() => {
    const row = lot.value ? store.find(lot.value.procurement_id) : undefined

    return row && store.canView(row, auth.userId, auth.ppmpRoleId) ? row : undefined
})

const projectItems = computed(() => ppmp.items.map((row) => ({ id: row.id, title: row.title })))

async function save(values: Record<string, unknown>): Promise<void> {
    if (!item.value || !lot.value) {
        return
    }

    const confirmed = await modal.confirm({
        title: 'Save changes?',
        text: 'Do you want to save the changes to this item?',
        confirmText: 'Save Changes',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.updateItem(item.value.id, values as never)
    modal.success('Item updated successfully')

    await navigateTo(`/PIMS/purchase-request/lots/${lot.value.id}`)
}
</script>

<template>
    <div v-if="item && lot && procurement">
        <PageHeader
            title="Purchase Request"
            :back-to="`/PIMS/purchase-request/lots/${lot.id}`"
            :crumbs="[
                { to: '/PIMS/purchase-request', icon: true },
                { to: `/PIMS/purchase-request/${procurement.id}`, label: procurement.title },
                { to: `/PIMS/purchase-request/lots/${lot.id}`, label: `Lot ${lot.lot_no}` },
                { label: 'Edit Item' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-header pb-0">
                            <div class="d-flex align-items-center">
                                <p class="mb-0" style="font-size: 20px">Edit Item</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <PrItemForm
                                :item="item"
                                :project-items="projectItems"
                                submit-label="Save Changes"
                                :cancel-to="`/PIMS/purchase-request/lots/${lot.id}`"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Item not found" back-to="/PIMS/purchase-request" />
</template>
