<script setup lang="ts">
import { computed } from 'vue'

/** Add a Project Item to a PPMP. */
const route = useRoute()
const auth = useAuthStore()
const store = usePpmpStore()
const modal = usePimsModal()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))

/**
 * Source of Funds follows the plan's type: an Indicative plan is drawn against
 * the NEP, a Final or Updated one against the GAA.
 */
const sourceFundId = computed(() => (plan.value?.type_id === 1 ? 1 : 2))

async function save(values: Record<string, unknown>): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Add Project Item?',
        text: 'Do you want to add this Project Item to the PPMP?',
        confirmText: 'Add Project Item',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.createItem({
        ...values,
        ppmp_id: ppmpId.value,
        user_id: auth.userId,
        fieldoffice_id: auth.user.area_office_id,
        unit_id: auth.user.office_unit_id,
    } as never)

    modal.success('Project Item added successfully')

    await navigateTo(`/PIMS/PPMP/${ppmpId.value}`)
}
</script>

<template>
    <div v-if="plan">
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            :back-to="`/PIMS/PPMP/${plan.id}`"
            :crumbs="[
                { to: '/PIMS/PPMP', icon: true },
                { to: `/PIMS/PPMP/${plan.id}`, label: `View '${plan.name}'` },
                { label: 'Add Project Item' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Add PPMP Project Item</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <PpmpItemForm
                                :fiscal-year="plan.fiscal_year"
                                :source-fund-id="sourceFundId"
                                submit-label="Add Project Item"
                                :cancel-to="`/PIMS/PPMP/${plan.id}`"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="PPMP not found" back-to="/PIMS/PPMP" />
</template>
