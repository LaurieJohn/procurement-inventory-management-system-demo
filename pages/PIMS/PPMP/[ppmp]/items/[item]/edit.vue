<script setup lang="ts">
import { computed } from 'vue'

/** Edit a PPMP Project Item. */
const route = useRoute()
const store = usePpmpStore()
const modal = usePimsModal()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))
const item = computed(() => store.findItem(Number(route.params.item)))

const sourceFundId = computed(() => item.value?.source_fund_id ?? 1)

async function save(values: Record<string, unknown>): Promise<void> {
    if (!item.value) {
        return
    }

    const confirmed = await modal.confirm({
        title: 'Save changes?',
        text: 'Do you want to save the changes to this Project Item?',
        confirmText: 'Save Changes',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.updateItem(item.value.id, values as never)
    modal.success('Project Item updated successfully')

    await navigateTo(`/PIMS/PPMP/${ppmpId.value}`)
}
</script>

<template>
    <div v-if="plan && item">
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            :back-to="`/PIMS/PPMP/${plan.id}`"
            :crumbs="[
                { to: '/PIMS/PPMP', icon: true },
                { to: `/PIMS/PPMP/${plan.id}`, label: `View '${plan.name}'` },
                { label: 'Edit Project Item' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Edit PPMP Project Item</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <PpmpItemForm
                                :item="item"
                                :fiscal-year="plan.fiscal_year"
                                :source-fund-id="sourceFundId"
                                submit-label="Save Changes"
                                :cancel-to="`/PIMS/PPMP/${plan.id}`"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Project Item not found" back-to="/PIMS/PPMP" />
</template>
