<script setup lang="ts">
import { computed } from 'vue'

/** Add an item to a lot. */
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

/**
 * Every Purchase Request item is drawn from a PPMP Project Item, so the picker
 * offers the entries on the plans this office takes part in.
 */
const projectItems = computed(() =>
    ppmp.items.map((item) => ({ id: item.id, title: item.title })),
)

async function save(values: Record<string, unknown>): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Are you sure?',
        text: 'Do you want to proceed to add an item on this Lot?',
        confirmText: 'Add Item',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.addItem({ ...values, lot_id: lotId.value } as never)
    modal.success('Item added successfully')

    await navigateTo(`/PIMS/purchase-request/lots/${lotId.value}`)
}
</script>

<template>
    <div v-if="lot && procurement">
        <PageHeader
            title="Purchase Request"
            :back-to="`/PIMS/purchase-request/lots/${lot.id}`"
            :crumbs="[
                { to: '/PIMS/purchase-request', icon: true },
                { to: `/PIMS/purchase-request/${procurement.id}`, label: procurement.title },
                { to: `/PIMS/purchase-request/lots/${lot.id}`, label: `Lot ${lot.lot_no}` },
                { label: 'Add New Item' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-header pb-0">
                            <div class="d-flex align-items-center">
                                <p class="mb-0" style="font-size: 20px">Add New Item</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <PrItemForm
                                :project-items="projectItems"
                                submit-label="Add New Item"
                                :cancel-to="`/PIMS/purchase-request/lots/${lot.id}`"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Lot not found" back-to="/PIMS/purchase-request" />
</template>
