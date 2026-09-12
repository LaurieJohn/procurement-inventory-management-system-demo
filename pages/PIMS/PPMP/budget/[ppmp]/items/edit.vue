<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ppmpCategories } from '~/data/reference'

// The officer review pages belong to the PIMS administration console, so they
// carry its sidebar rather than the requester's.
definePageMeta({ layout: 'admin' })

/**
 * The Budget Officer's pass over a PPMP awaiting approval.
 *
 * Budget only prices what Supply specified, so the only editable columns are
 * the Authorized Budgetary Allocation and the note beside it.
 */
const route = useRoute()
const store = usePpmpStore()
const modal = usePimsModal()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))

const filters = reactive({
    field_office: '' as number | '',
    category: '',
    budget_modified: '',
    title: '',
})

const items = computed(() =>
    store.itemsFor(ppmpId.value).filter((item) => {
        if (filters.field_office !== '' && item.fieldoffice_id !== Number(filters.field_office)) {
            return false
        }

        if (filters.category && store.categoryName(item.category_id) !== filters.category) {
            return false
        }

        if (filters.budget_modified === '1' && !item.budget_modified) {
            return false
        }

        if (filters.budget_modified === '0' && item.budget_modified) {
            return false
        }

        if (filters.title && !item.title.toLowerCase().includes(filters.title.toLowerCase())) {
            return false
        }

        return true
    }),
)

type Draft = { amount: number; budget_remarks: string }

const drafts = reactive<Record<number, Draft>>({})

function draftFor(itemId: number): Draft {
    if (!drafts[itemId]) {
        const item = store.findItem(itemId)!

        drafts[itemId] = { amount: item.amount, budget_remarks: item.budget_remarks ?? '' }
    }

    return drafts[itemId]
}

/** The running total the Budget Officer is signing off on. */
const draftTotal = computed(() =>
    items.value.reduce((total, item) => total + Number(draftFor(item.id).amount || 0), 0),
)

const availableOffices = computed(() => {
    const ids = [...new Set(store.itemsFor(ppmpId.value).map((item) => item.fieldoffice_id))]

    return ids.map((id) => ({ id, name: store.fieldOfficeName(id) }))
})

function clearFilters(): void {
    filters.field_office = ''
    filters.category = ''
    filters.budget_modified = ''
    filters.title = ''
}

const saving = ref(false)

async function save(): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Save the revised allocations?',
        text: 'The revised Authorized Budgetary Allocations will replace the estimates on this PPMP. Are you sure you want to proceed?',
        confirmText: 'Save Allocations',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    saving.value = true

    for (const item of items.value) {
        const draft = drafts[item.id]

        if (!draft) {
            continue
        }

        store.applyBudgetReview(item.id, Number(draft.amount), draft.budget_remarks || null)
    }

    saving.value = false
    modal.success('Authorized Budgetary Allocations updated successfully')

    // Reached from the console, so saving hands the plan back to it.
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
                { to: `/PIMS/admin/PPMP/${plan.id}`, label: `View '${plan.name}'` },
                { label: 'Modify Budgetary Allocation' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3 d-flex align-items-center justify-content-between">
                            <p class="mb-0">
                                Modify the Authorized Budgetary Allocation (PhP) on this PPMP
                            </p>

                            <span class="badge badge-lg badge-primary">
                                Total: {{ peso(draftTotal) }}
                            </span>
                        </div>

                        <!-- Filters -->
                        <form class="mb-4 p-3 border-0 rounded" @submit.prevent>
                            <div class="mb-2">
                                <label class="mb-1"><strong>Filter by:</strong></label>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group mb-2">
                                        <label class="small mb-1">
                                            <strong>Division/Field Office:</strong>
                                        </label>
                                        <select v-model="filters.field_office" class="form-control w-100">
                                            <option value="">All Offices</option>
                                            <option
                                                v-for="office in availableOffices"
                                                :key="office.id"
                                                :value="office.id"
                                            >
                                                {{ office.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="form-group mb-2">
                                        <label class="small mb-1"><strong>Category:</strong></label>
                                        <select v-model="filters.category" class="form-control w-100">
                                            <option value="">All Categories</option>
                                            <option
                                                v-for="category in ppmpCategories"
                                                :key="category.id"
                                                :value="category.name"
                                            >
                                                {{ String.fromCharCode(64 + category.id) }}.
                                                {{ category.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="form-group mb-2">
                                        <label class="small mb-1"><strong>Item Status:</strong></label>
                                        <select v-model="filters.budget_modified" class="form-control w-100">
                                            <option value="">All Items</option>
                                            <option value="1">Finished</option>
                                            <option value="0">Unfinished</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-group mb-2">
                                        <label class="small mb-1"><strong>Project Title:</strong></label>
                                        <input
                                            v-model="filters.title"
                                            type="text"
                                            class="form-control w-100"
                                            placeholder="Search by Project Title"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex">
                                <div class="ml-auto d-flex flex-column">
                                    <button type="button" class="btn btn-secondary" @click="clearFilters">
                                        Clear Filter
                                    </button>
                                </div>
                            </div>
                        </form>

                        <form @submit.prevent="save">
                            <div class="card mb-3 shadow-sm">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-sm align-items-center mb-0">
                                        <thead class="thead-light text-center">
                                            <tr>
                                                <th>#</th>
                                                <th style="min-width: 320px">Project Title</th>
                                                <th>Division/Field Office &amp; Unit</th>
                                                <th>Quantity</th>
                                                <th>Mode of Procurement</th>
                                                <th style="min-width: 200px">
                                                    Authorized Budgetary Allocation (PhP)
                                                    <span class="text-danger">*</span>
                                                </th>
                                                <th style="width: 320px">Budget Officer Notes</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr
                                                v-for="(item, index) in items"
                                                :key="item.id"
                                                :class="{ 'table-success': item.budget_modified }"
                                            >
                                                <td class="text-center">{{ index + 1 }}</td>

                                                <td class="text-wrap">{{ item.title }}</td>

                                                <td class="text-center">
                                                    {{ store.fieldOfficeName(item.fieldoffice_id) }}<br />
                                                    {{ store.unitName(item.unit_id) }}
                                                </td>

                                                <td class="text-center">
                                                    {{ item.quantity }}
                                                    {{ store.quantityTypeName(item.quantity_type) }}
                                                </td>

                                                <td>{{ store.modeProcurementName(item.mode_procurement_id) }}</td>

                                                <td>
                                                    <input
                                                        v-model.number="draftFor(item.id).amount"
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        class="form-control form-control-sm text-right"
                                                        required
                                                    />
                                                </td>

                                                <td>
                                                    <textarea
                                                        v-model="draftFor(item.id).budget_remarks"
                                                        class="form-control form-control-sm"
                                                        rows="2"
                                                        placeholder="Note the reason for the revision"
                                                    ></textarea>
                                                </td>
                                            </tr>

                                            <tr v-if="items.length === 0">
                                                <td colspan="7" class="text-center bg-light py-4">
                                                    <small class="text-muted text-uppercase">
                                                        No project items match the current filter.
                                                    </small>
                                                </td>
                                            </tr>
                                        </tbody>

                                        <tfoot v-if="items.length" class="thead-light">
                                            <tr>
                                                <th colspan="5" class="text-right">Total</th>
                                                <th class="text-right">{{ peso(draftTotal) }}</th>
                                                <th></th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div class="text-center card-footer bg-transparent">
                                <NuxtLink :to="`/PIMS/admin/PPMP/${plan.id}`" class="btn btn-secondary">
                                    Back
                                </NuxtLink>

                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                    :disabled="saving || items.length === 0"
                                >
                                    Save Allocations
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="PPMP not found" back-to="/PIMS/admin/PPMP" />
</template>
