<script setup lang="ts">
/**
 * The PPMP listing — every plan the office can open.
 */
const ppmp = usePpmpStore()
</script>

<template>
    <div>
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            :crumbs="[{ to: '/PIMS/PPMP', icon: true }, { label: 'Index' }]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header border-0">
                            <h3 class="mb-0">Procurement and Inventory Management System (PIMS)</h3>

                            <div class="row">
                                <div class="col-xl-12 text-right">
                                    <NuxtLink to="/PIMS/PPMP/sub-categories" class="btn btn-primary">
                                        View all Sub-Categories
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-items-center table-flush">
                                <thead class="thead-light">
                                    <tr>
                                        <th scope="col">Title</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Fiscal Year</th>
                                        <th scope="col">Deadline of Submission</th>
                                        <th scope="col">Created At</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="plan in ppmp.allPpmps" :key="plan.id">
                                        <td>
                                            <NuxtLink
                                                :to="`/PIMS/PPMP/${plan.id}`"
                                                class="name mb-0"
                                                style="font-size: 15px"
                                            >
                                                {{ plan.name }}
                                            </NuxtLink>
                                        </td>

                                        <td>{{ ppmp.typeName(plan.type_id) }}</td>

                                        <td>{{ plan.fiscal_year }}</td>

                                        <td>{{ longDate(plan.ppmp_deadline_at) }}</td>

                                        <td>{{ longDate(plan.created_at) }}</td>

                                        <td>
                                            <span
                                                class="status badge badge-sm bg-white text-blue border"
                                            >
                                                {{ ppmp.statusName(plan.status_id) }}
                                            </span>
                                        </td>
                                    </tr>

                                    <tr v-if="ppmp.allPpmps.length === 0">
                                        <td colspan="6" class="text-center text-muted">
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
