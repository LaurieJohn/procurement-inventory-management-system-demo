<script setup lang="ts">
import { computed } from 'vue'

/** Every PPMP, with the admin actions on each. */
definePageMeta({ layout: 'admin' })

const auth = useAuthStore()
const store = usePpmpStore()
const modal = usePimsModal()

const canManage = computed(() => auth.canManagePpmp)

/**
 * Only an Admin may open a second plan while one is still on-going; a Supply
 * Officer has to wait for the current one to be consolidated.
 */
const canCreate = computed(
    () => canManage.value && (auth.isSuperAdmin || auth.ppmpRoleId === 1 || !store.hasOngoingPpmp),
)

async function confirmDelete(id: number): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Delete PPMP?',
        text: 'This will permanently delete the PPMP together with its project items.',
        confirmText: 'Delete',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.deletePpmp(id)
    modal.success('PPMP deleted successfully')
}
</script>

<template>
    <div>
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            :crumbs="[{ to: '/PIMS/admin', icon: true }, { label: 'Manage PPMP' }]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header border-0">
                            <h3 class="mb-0">
                                Procurement and Inventory Management System (PIMS) (ADMIN PANEL)
                            </h3>

                            <div class="row">
                                <div class="col-xl-12 text-right">
                                    <NuxtLink
                                        v-if="canCreate"
                                        to="/PIMS/admin/PPMP/create"
                                        class="btn btn-primary"
                                    >
                                        Create new PPMP
                                    </NuxtLink>

                                    <button
                                        v-else-if="canManage"
                                        type="button"
                                        class="btn btn-primary disabled"
                                        disabled
                                        title="Creating of PPMP is not allowed while one is still on-going."
                                    >
                                        Create new PPMP
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-items-center table-flush">
                                <thead class="thead-light">
                                    <tr>
                                        <th scope="col">Action</th>
                                        <th scope="col">Title</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Fiscal Year</th>
                                        <th scope="col">Deadline of Submission</th>
                                        <th scope="col">Created At</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="plan in store.allPpmps" :key="plan.id">
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
                                                    :to="`/PIMS/admin/PPMP/${plan.id}`"
                                                >
                                                    View PPMP
                                                </NuxtLink>

                                                <template v-if="canManage">
                                                    <div class="dropdown-divider"></div>

                                                    <NuxtLink
                                                        class="dropdown-item"
                                                        :to="`/PIMS/admin/PPMP/${plan.id}/edit`"
                                                    >
                                                        Edit Details
                                                    </NuxtLink>

                                                    <div class="dropdown-divider"></div>

                                                    <button
                                                        type="button"
                                                        class="dropdown-item text-danger"
                                                        @click="confirmDelete(plan.id)"
                                                    >
                                                        Delete
                                                    </button>
                                                </template>
                                            </AppDropdown>
                                        </td>

                                        <td>
                                            <NuxtLink
                                                :to="`/PIMS/admin/PPMP/${plan.id}`"
                                                class="name mb-0"
                                                style="font-size: 15px"
                                            >
                                                {{ plan.name }}
                                            </NuxtLink>
                                        </td>

                                        <td>{{ store.typeName(plan.type_id) }}</td>
                                        <td>{{ plan.fiscal_year }}</td>
                                        <td>{{ longDate(plan.ppmp_deadline_at) }}</td>
                                        <td>{{ longDate(plan.created_at) }}</td>
                                        <td>
                                            <span class="status badge badge-sm bg-white text-blue border">
                                                {{ store.statusName(plan.status_id) }}
                                            </span>
                                        </td>
                                    </tr>

                                    <tr v-if="store.allPpmps.length === 0">
                                        <td colspan="7" class="text-center text-muted">
                                            No PPMP projects found.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="card-footer py-4">
                            <nav aria-label="Pagination">
                                <ul class="pagination justify-content-end mb-0">
                                    <li class="page-item disabled">
                                        <span class="page-link"><i class="fas fa-angle-left"></i></span>
                                    </li>
                                    <li class="page-item active">
                                        <span class="page-link">1</span>
                                    </li>
                                    <li class="page-item disabled">
                                        <span class="page-link"><i class="fas fa-angle-right"></i></span>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
