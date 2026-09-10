<script setup lang="ts">
import { computed } from 'vue'

/** One PPMP Project Item, read-only, on the administration console. */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const store = usePpmpStore()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))
const item = computed(() => store.findItem(Number(route.params.item)))
</script>

<template>
    <div v-if="plan && item">
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            :back-to="`/PIMS/admin/PPMP/${plan.id}`"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: `/PIMS/admin/PPMP/${plan.id}`, label: `View '${plan.name}'` },
                { label: 'View Project Item' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">PPMP Project Item Details</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-bordered table-striped mb-4">
                                    <tbody>
                                        <tr>
                                            <th>Project Title</th>
                                            <td>{{ item.title }}</td>
                                        </tr>
                                        <tr>
                                            <th>Category</th>
                                            <td>{{ store.categoryName(item.category_id) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Sub-Category</th>
                                            <td>{{ store.subCategoryName(item.sub_category_id) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Quantity</th>
                                            <td>{{ item.quantity }}</td>
                                        </tr>
                                        <tr>
                                            <th>Quantity Type</th>
                                            <td>{{ store.quantityTypeName(item.quantity_type) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Pre-Procurement Conference</th>
                                            <td>{{ item.pre_procurement_status ? 'Yes' : 'No' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Project Type</th>
                                            <td>{{ store.projectTypeName(item.project_type_id) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Mode of Procurement</th>
                                            <td>
                                                {{ store.modeProcurementName(item.mode_procurement_id) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Expected Delivery / Implementation Period</th>
                                            <td>{{ monthYear(item.expected_date) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Start of Procurement Activity</th>
                                            <td>{{ monthYear(item.start_date) }}</td>
                                        </tr>
                                        <tr>
                                            <th>End of Procurement Activity</th>
                                            <td>{{ monthYear(item.end_date) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Estimated Budget (PhP)</th>
                                            <td>{{ peso(item.amount) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Source of Funds</th>
                                            <td>{{ store.sourceFundName(item.source_fund_id) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Attached Supporting Documents (Link)</th>
                                            <td>{{ item.attached_documents ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Remarks</th>
                                            <td>{{ item.remarks ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>RO Supply Officer Remarks</th>
                                            <td>{{ item.supply_remarks ?? '-' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Budget Officer Remarks</th>
                                            <td>{{ item.budget_remarks ?? '-' }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h5 class="mb-2">Item Information</h5>

                            <div class="table-responsive">
                                <table class="table table-bordered table-sm w-50">
                                    <tbody>
                                        <tr>
                                            <th>Created By</th>
                                            <td>{{ store.userName(item.user_id) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Division / Field Office</th>
                                            <td>{{ store.fieldOfficeName(item.fieldoffice_id) }}</td>
                                        </tr>
                                        <tr>
                                            <th>Unit</th>
                                            <td>{{ store.unitName(item.unit_id) || 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <th>Date Created</th>
                                            <td>{{ longDate(item.created_at) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="text-center card-footer bg-transparent mt-5">
                                <NuxtLink :to="`/PIMS/admin/PPMP/${plan.id}`" class="btn btn-secondary">
                                    Return to PPMP
                                </NuxtLink>

                                <NuxtLink
                                    :to="`/PIMS/admin/PPMP/${plan.id}/items/${item.id}/edit`"
                                    class="btn btn-primary ml-2"
                                >
                                    Edit Item Details
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Project Item not found" back-to="/PIMS/admin/PPMP" />
</template>
