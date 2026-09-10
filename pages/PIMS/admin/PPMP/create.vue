<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Open a new PPMP.
 *
 * The fiscal year is chosen first, because it decides what kind of plan this
 * would be — the first plan of a year is Indicative, the second Final, and any
 * after that an Updated revision.
 */
definePageMeta({ layout: 'admin' })

const auth = useAuthStore()
const store = usePpmpStore()
const modal = usePimsModal()

/** Planning runs a year ahead, so next year is offered first. */
const currentYear = new Date().getFullYear()
const fiscalYear = ref(currentYear + 1)
const fiscalYearChosen = ref(false)

const fiscalYearOptions = [currentYear, currentYear + 1, currentYear + 2]

const detected = computed(() => store.detectNextPlan(fiscalYear.value))

async function save(values: Record<string, unknown>): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Create this PPMP?',
        text: 'Divisions and Field Offices will be able to submit their project items against it once it is created.',
        confirmText: 'Create PPMP',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    const plan = store.createPpmp({ ...values, user_id: auth.userId } as never)

    modal.success('PPMP created successfully')

    await navigateTo(`/PIMS/admin/PPMP/${plan.id}`)
}
</script>

<template>
    <div>
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            back-to="/PIMS/admin/PPMP"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/PPMP', label: 'Manage PPMP' },
                { label: 'Create PPMP' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">
                                    Create Procurement and Inventory Management System (PIMS)
                                </p>
                            </div>
                        </div>

                        <div class="card-body">
                            <!-- Fiscal year first: it decides the type and version below. -->
                            <div v-if="!fiscalYearChosen" class="row justify-content-center py-4">
                                <div class="col-md-6 text-center">
                                    <h4 class="mb-3">Which fiscal year is this PPMP for?</h4>

                                    <select v-model.number="fiscalYear" class="form-control mb-3">
                                        <option v-for="year in fiscalYearOptions" :key="year" :value="year">
                                            FY {{ year }}
                                        </option>
                                    </select>

                                    <p class="text-sm text-muted">
                                        PPMP Type:
                                        <strong>
                                            {{
                                                { 1: 'Indicative', 2: 'Final', 3: 'Updated' }[
                                                    detected.typeId
                                                ]
                                            }}
                                        </strong>
                                        &middot; Version {{ detected.versionNo }}
                                    </p>

                                    <NuxtLink to="/PIMS/admin/PPMP" class="btn btn-secondary">
                                        Back
                                    </NuxtLink>

                                    <button
                                        type="button"
                                        class="btn btn-primary"
                                        @click="fiscalYearChosen = true"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>

                            <PpmpPlanForm
                                v-else
                                :detected="detected"
                                submit-label="Submit"
                                cancel-to="/PIMS/admin/PPMP"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
