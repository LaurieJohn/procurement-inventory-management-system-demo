<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ppmpCategories, ppmpModeProcurements, ppmpProjectTypes, quantityTypes } from '~/data/reference'

// The officer review pages belong to the PIMS administration console, so they
// carry its sidebar rather than the requester's.
definePageMeta({ layout: 'admin' })

/**
 * The RO Supply Officer's review pass over a closed PPMP: every project item on
 * one screen, with the fields Supply may correct and a note per row.
 *
 * Supply specifies what is bought; Budget prices it, on its own page.
 */
const route = useRoute()
const store = usePpmpStore()
const modal = usePimsModal()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))

const filters = reactive({
    field_office: '' as number | '',
    unit: '' as number | '',
    category: '',
    supply_modified: '',
    title: '',
})

const items = computed(() =>
    store.itemsFor(ppmpId.value).filter((item) => {
        if (filters.field_office !== '' && item.fieldoffice_id !== Number(filters.field_office)) {
            return false
        }

        if (filters.unit !== '' && item.unit_id !== Number(filters.unit)) {
            return false
        }

        if (filters.category && store.categoryName(item.category_id) !== filters.category) {
            return false
        }

        if (filters.supply_modified === '1' && !item.supply_modified) {
            return false
        }

        if (filters.supply_modified === '0' && item.supply_modified) {
            return false
        }

        if (filters.title && !item.title.toLowerCase().includes(filters.title.toLowerCase())) {
            return false
        }

        return true
    }),
)

/**
 * The rows are edited as a batch and only written back on save, so each one is
 * held as a draft keyed by item id.
 */
type Draft = {
    title: string
    category_id: number
    sub_category_id: number
    project_type_id: number
    quantity: string
    quantity_type: number | null
    mode_procurement_id: number
    start_date: string | null
    end_date: string | null
    supply_remarks: string
}

const drafts = reactive<Record<number, Draft>>({})

function draftFor(itemId: number): Draft {
    if (!drafts[itemId]) {
        const item = store.findItem(itemId)!

        drafts[itemId] = {
            title: item.title,
            category_id: item.category_id,
            sub_category_id: item.sub_category_id,
            project_type_id: item.project_type_id,
            quantity: item.quantity,
            quantity_type: item.quantity_type,
            mode_procurement_id: item.mode_procurement_id,
            start_date: item.start_date,
            end_date: item.end_date,
            supply_remarks: item.supply_remarks ?? '',
        }
    }

    return drafts[itemId]
}

const availableOffices = computed(() => {
    const ids = [...new Set(store.itemsFor(ppmpId.value).map((item) => item.fieldoffice_id))]

    return ids.map((id) => ({ id, name: store.fieldOfficeName(id) }))
})

const availableUnits = computed(() => {
    const ids = [
        ...new Set(
            store
                .itemsFor(ppmpId.value)
                .map((item) => item.unit_id)
                .filter((id): id is number => id !== null),
        ),
    ]

    return ids.map((id) => ({ id, name: store.unitName(id) }))
})

function clearFilters(): void {
    filters.field_office = ''
    filters.unit = ''
    filters.category = ''
    filters.supply_modified = ''
    filters.title = ''
}

const saving = ref(false)

async function save(): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Save the revised details?',
        text: 'The revised details will replace what the Divisions and Field Offices submitted. Are you sure you want to proceed?',
        confirmText: 'Save Revisions',
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

        store.applySupplyReview(item.id, {
            ...draft,
            supply_remarks: draft.supply_remarks || null,
        })
    }

    saving.value = false
    modal.success('Project Item details updated successfully')

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
                { label: 'Revise Project Item Details' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Revise PPMP Project Item Details</p>
                            </div>
                        </div>

                        <!-- Filters -->
                        <form class="mb-4 p-3 border-0 rounded" @submit.prevent>
                            <div class="mb-2">
                                <label class="mb-1"><strong>Filter by:</strong></label>
                            </div>

                            <div class="row">
                                <div class="col-md-3">
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

                                <div class="col-md-3">
                                    <div class="form-group mb-2">
                                        <label class="small mb-1"><strong>Unit:</strong></label>
                                        <select v-model="filters.unit" class="form-control w-100">
                                            <option value="">All Units</option>
                                            <option
                                                v-for="unit in availableUnits"
                                                :key="unit.id"
                                                :value="unit.id"
                                            >
                                                {{ unit.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-3">
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

                                <div class="col-md-3">
                                    <div class="form-group mb-2">
                                        <label class="small mb-1"><strong>Item Status:</strong></label>
                                        <select v-model="filters.supply_modified" class="form-control w-100">
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

                        <!-- Batch edit -->
                        <form @submit.prevent="save">
                            <div class="card mb-3 shadow-sm">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-sm align-items-center mb-0">
                                        <thead class="thead-light text-center">
                                            <tr>
                                                <th>#</th>
                                                <th style="min-width: 300px">
                                                    Project Title <span class="text-danger">*</span>
                                                </th>
                                                <th>Created by</th>
                                                <th>Division/Field Office &amp; Unit</th>
                                                <th style="min-width: 200px">
                                                    Category <span class="text-danger">*</span>
                                                </th>
                                                <th style="min-width: 320px">
                                                    Sub-Category <span class="text-danger">*</span>
                                                </th>
                                                <th style="min-width: 160px">
                                                    Project Type <span class="text-danger">*</span>
                                                </th>
                                                <th>Quantity <span class="text-danger">*</span></th>
                                                <th>Quantity Type <span class="text-danger">*</span></th>
                                                <th style="min-width: 220px">
                                                    Mode of Procurement <span class="text-danger">*</span>
                                                </th>
                                                <th style="min-width: 180px">Timeline</th>
                                                <th style="width: 320px">RO Supply Officer Notes</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr
                                                v-for="(item, index) in items"
                                                :key="item.id"
                                                :class="{ 'table-success': item.supply_modified }"
                                            >
                                                <td class="text-center">{{ index + 1 }}</td>

                                                <td class="text-wrap">
                                                    <textarea
                                                        v-model="draftFor(item.id).title"
                                                        class="form-control form-control-sm"
                                                        rows="2"
                                                        required
                                                    ></textarea>
                                                </td>

                                                <td class="text-center">{{ store.userName(item.user_id) }}</td>

                                                <td class="text-center">
                                                    {{ store.fieldOfficeName(item.fieldoffice_id) }}<br />
                                                    {{ store.unitName(item.unit_id) }}
                                                </td>

                                                <td>
                                                    <select
                                                        v-model.number="draftFor(item.id).category_id"
                                                        class="form-control form-control-sm"
                                                        required
                                                    >
                                                        <option
                                                            v-for="category in ppmpCategories"
                                                            :key="category.id"
                                                            :value="category.id"
                                                        >
                                                            <template v-if="category.id <= 12">
                                                                {{ String.fromCharCode(64 + category.id) }}.
                                                            </template>
                                                            {{ category.name }}
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <select
                                                        v-model.number="draftFor(item.id).sub_category_id"
                                                        class="form-control form-control-sm"
                                                        required
                                                    >
                                                        <option
                                                            v-for="subCategory in store.subCategoriesFor(
                                                                draftFor(item.id).category_id,
                                                            )"
                                                            :key="subCategory.id"
                                                            :value="subCategory.id"
                                                        >
                                                            {{ subCategory.name }}
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <select
                                                        v-model.number="draftFor(item.id).project_type_id"
                                                        class="form-control form-control-sm"
                                                        required
                                                    >
                                                        <option
                                                            v-for="type in ppmpProjectTypes"
                                                            :key="type.id"
                                                            :value="type.id"
                                                        >
                                                            {{ type.name }}
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <input
                                                        v-model="draftFor(item.id).quantity"
                                                        type="text"
                                                        class="form-control form-control-sm"
                                                        required
                                                    />
                                                </td>

                                                <td>
                                                    <select
                                                        v-model.number="draftFor(item.id).quantity_type"
                                                        class="form-control form-control-sm"
                                                        required
                                                    >
                                                        <option
                                                            v-for="type in quantityTypes"
                                                            :key="type.id"
                                                            :value="type.id"
                                                        >
                                                            {{ type.name }}
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <select
                                                        v-model.number="draftFor(item.id).mode_procurement_id"
                                                        class="form-control form-control-sm"
                                                        required
                                                    >
                                                        <option
                                                            v-for="mode in ppmpModeProcurements"
                                                            :key="mode.id"
                                                            :value="mode.id"
                                                        >
                                                            {{ mode.name }}
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <input
                                                        v-model="draftFor(item.id).start_date"
                                                        type="month"
                                                        class="form-control form-control-sm mb-1"
                                                    />
                                                    <input
                                                        v-model="draftFor(item.id).end_date"
                                                        type="month"
                                                        class="form-control form-control-sm"
                                                    />
                                                </td>

                                                <td>
                                                    <textarea
                                                        v-model="draftFor(item.id).supply_remarks"
                                                        class="form-control form-control-sm"
                                                        rows="2"
                                                        placeholder="Note what was changed and why"
                                                    ></textarea>
                                                </td>
                                            </tr>

                                            <tr v-if="items.length === 0">
                                                <td colspan="12" class="text-center bg-light py-4">
                                                    <small class="text-muted text-uppercase">
                                                        No project items match the current filter.
                                                    </small>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="text-center card-footer bg-transparent">
                                <NuxtLink :to="`/PIMS/PPMP/${plan.id}`" class="btn btn-secondary">
                                    Back
                                </NuxtLink>

                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                    :disabled="saving || items.length === 0"
                                >
                                    Save Revisions
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="PPMP not found" back-to="/PIMS/PPMP" />
</template>
