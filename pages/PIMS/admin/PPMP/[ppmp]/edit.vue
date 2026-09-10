<script setup lang="ts">
import { computed } from 'vue'

/** Edit a PPMP's header: its deadlines and the offices it covers. */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const store = usePpmpStore()
const modal = usePimsModal()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))
const selectedOffices = computed(() => store.fieldOfficeIdsFor(ppmpId.value))

const detected = computed(() => store.detectNextPlan(plan.value?.fiscal_year ?? new Date().getFullYear()))

async function save(values: Record<string, unknown>): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Save changes?',
        text: 'Do you want to save the changes to this PPMP?',
        confirmText: 'Save Changes',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.updatePpmp(ppmpId.value, values as never)
    modal.success('PPMP updated successfully')

    await navigateTo(`/PIMS/admin/PPMP/${ppmpId.value}`)
}
</script>

<template>
    <div v-if="plan">
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            :back-to="`/PIMS/admin/PPMP/${plan.id}`"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/PPMP', label: 'Manage PPMP' },
                { label: 'Edit Details' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Edit PPMP Details</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <PpmpPlanForm
                                :plan="plan"
                                :detected="detected"
                                :selected-offices="selectedOffices"
                                submit-label="Save Changes"
                                :cancel-to="`/PIMS/admin/PPMP/${plan.id}`"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="PPMP not found" back-to="/PIMS/admin/PPMP" />
</template>
