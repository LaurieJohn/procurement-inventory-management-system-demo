<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { fieldOfficeMap, officeUnits, ppmpCategories, PPMP_ROLE } from '~/data/reference'
import { FIELD_OFFICE_LOCKED } from '~/stores/ppmp'
import type { Ppmp, PpmpItem } from '~/data/demo'

/**
 * The Project Items on one PPMP, with the filter strip above them.
 *
 * The requester page passes the items the signed-in user encoded; the admin
 * page passes every item and sets `admin`, which adds the transfer action and
 * points the links at the admin routes.
 */
const props = withDefaults(
    defineProps<{ plan: Ppmp; items: PpmpItem[]; admin?: boolean }>(),
    { admin: false },
)

const auth = useAuthStore()
const store = usePpmpStore()
const modal = usePimsModal()

const basePath = computed(() =>
    props.admin ? `/PIMS/admin/PPMP/${props.plan.id}` : `/PIMS/PPMP/${props.plan.id}`,
)

const isSupplyOfficer = computed(() => auth.ppmpRoleId === PPMP_ROLE.supplyOfficer)

const filters = reactive({
    field_office: '' as number | '',
    unit: '' as number | '',
    category: '',
    title: '',
})

const page = ref(1)
const perPage = 10

const filtered = computed(() =>
    props.items.filter((item) => {
        if (filters.field_office !== '' && item.fieldoffice_id !== Number(filters.field_office)) {
            return false
        }

        if (filters.unit !== '' && item.unit_id !== Number(filters.unit)) {
            return false
        }

        if (filters.category && store.categoryName(item.category_id) !== filters.category) {
            return false
        }

        if (filters.title && !item.title.toLowerCase().includes(filters.title.toLowerCase())) {
            return false
        }

        return true
    }),
)

const lastPage = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))

/** Only the offices and units that actually appear on this plan's items. */
const availableOffices = computed(() => {
    const ids = [...new Set(props.items.map((item) => item.fieldoffice_id))]

    return ids.map((id) => ({ id, name: store.fieldOfficeName(id) }))
})

const availableUnits = computed(() => {
    const ids = [
        ...new Set(props.items.map((item) => item.unit_id).filter((id): id is number => id !== null)),
    ]

    return ids.map((id) => ({ id, name: store.unitName(id) }))
})

function clearFilters(): void {
    filters.field_office = ''
    filters.unit = ''
    filters.category = ''
    filters.title = ''
    page.value = 1
}

/** Adding an item needs the viewer's own office to be open on this plan. */
const canAddItem = computed(() => store.canAddItem(props.plan.id, auth.user.area_office_id))

function itemIsLocked(fieldOfficeId: number): boolean {
    const status = store.fieldOfficeStatus(props.plan.id, fieldOfficeId)?.status_id

    return status !== undefined && FIELD_OFFICE_LOCKED.includes(status)
}

async function confirmDelete(itemId: number): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Delete Project Item?',
        text: "You won't be able to revert this action.",
        confirmText: 'Delete',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.deleteItem(itemId)
    modal.success('Project Item deleted successfully')
}

/* ----- Transfer (admin only) ----- */

const transferring = ref<number | null>(null)
const transfer = reactive({ field_office: 1, unit: null as number | null })

function openTransfer(itemId: number): void {
    const item = store.findItem(itemId)

    if (!item) {
        return
    }

    transfer.field_office = item.fieldoffice_id
    transfer.unit = item.unit_id
    transferring.value = itemId
}

async function confirmTransfer(): Promise<void> {
    if (transferring.value === null) {
        return
    }

    store.transferItem(transferring.value, Number(transfer.field_office), transfer.unit)
    transferring.value = null

    modal.success('Project Item transferred successfully')
}
</script>

<template>
    <div class="card shadow-sm">
        <div class="card-header d-flex flex-wrap align-items-center">
            <h4 class="mb-0">List of Project Items on this PPMP</h4>

            <NuxtLink
                v-if="canAddItem && !admin"
                :to="`${basePath}/items/create`"
                class="btn btn-success ml-auto"
            >
                Add Project Item <i class="fas fa-plus"></i>
            </NuxtLink>

            <button
                v-else-if="!admin"
                class="btn btn-success ml-auto"
                disabled
                title="Adding of Project Items on this PPMP is currently unavailable."
            >
                Add Project Item <i class="fas fa-plus"></i>
            </button>
        </div>

        <!-- Filters -->
        <form class="mb-4 p-3 border-0 rounded" @submit.prevent="page = 1">
            <div class="mb-2">
                <label class="mb-1"><strong>Filter by:</strong></label>
            </div>

            <div class="row">
                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="small mb-1"><strong>Division/Field Office:</strong></label>
                        <select v-model="filters.field_office" class="form-control w-100">
                            <option value="">All Offices</option>
                            <option v-for="office in availableOffices" :key="office.id" :value="office.id">
                                {{ office.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="form-group mb-2">
                        <label class="small mb-1"><strong>Unit:</strong></label>
                        <select v-model="filters.unit" class="form-control w-100">
                            <option value="">All Units</option>
                            <option v-for="unit in availableUnits" :key="unit.id" :value="unit.id">
                                {{ unit.name }}
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
                                {{ String.fromCharCode(64 + category.id) }}. {{ category.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="mt-2"></div>

            <div class="form-group">
                <label class="small mb-1"><strong>Project Title:</strong></label>
                <input
                    v-model="filters.title"
                    type="text"
                    class="form-control w-100"
                    placeholder="Search Project Title..."
                />
            </div>

            <div class="d-flex">
                <div class="ml-auto d-flex flex-column">
                    <button type="submit" class="btn btn-default mb-2 w-100">Filter</button>

                    <button type="button" class="btn btn-secondary" @click="clearFilters">
                        Clear Filter
                    </button>
                </div>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table table-bordered align-items-center table-flush">
                <thead class="thead-light">
                    <tr>
                        <th scope="col">Actions</th>
                        <th scope="col">Project Title</th>
                        <th>Created by</th>
                        <th>Division/Field Office &amp; Unit</th>
                        <th scope="col">Type of Project</th>
                        <th scope="col">Mode of Procurement</th>
                        <th scope="col">Source of Funds</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Remarks</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="item in paged"
                        :key="item.id"
                        :class="{ 'table-primary': item.status === 2 }"
                        :style="[4, 5].includes(item.status) ? 'background-color: #fff3cd;' : ''"
                    >
                        <td class="text-center">
                            <AppDropdown wrapper-class="btn-group">
                                <template #trigger="{ toggle }">
                                    <button type="button" class="btn btn-primary dropdown-toggle" @click="toggle">
                                        Select
                                    </button>
                                </template>

                                <NuxtLink class="dropdown-item" :to="`${basePath}/items/${item.id}`">
                                    View Project Item
                                </NuxtLink>

                                <template v-if="itemIsLocked(item.fieldoffice_id)">
                                    <span
                                        v-if="plan.status_id === 1"
                                        class="dropdown-item text-muted disabled"
                                        style="cursor: not-allowed"
                                    >
                                        Edit Details (Closed)
                                    </span>

                                    <NuxtLink
                                        v-if="plan.status_id === 3 && isSupplyOfficer"
                                        class="dropdown-item text-primary"
                                        :to="`${basePath}/items/${item.id}/edit`"
                                    >
                                        Revise PPMP Item Details
                                    </NuxtLink>
                                </template>

                                <NuxtLink
                                    v-else
                                    class="dropdown-item text-primary"
                                    :to="`${basePath}/items/${item.id}/edit`"
                                >
                                    Edit Details
                                </NuxtLink>

                                <button
                                    v-if="admin"
                                    type="button"
                                    class="dropdown-item"
                                    @click="openTransfer(item.id)"
                                >
                                    Transfer to another Office
                                </button>

                                <span
                                    v-if="itemIsLocked(item.fieldoffice_id) && plan.status_id === 1"
                                    class="dropdown-item text-muted disabled"
                                    style="cursor: not-allowed"
                                >
                                    Delete (Closed)
                                </span>

                                <button
                                    v-else-if="plan.status_id === 1"
                                    type="button"
                                    class="dropdown-item text-danger"
                                    @click="confirmDelete(item.id)"
                                >
                                    Delete
                                </button>
                            </AppDropdown>
                        </td>

                        <td>{{ item.title }}</td>
                        <td>{{ store.userName(item.user_id) }}</td>
                        <td>
                            {{ store.fieldOfficeName(item.fieldoffice_id) }}<br />
                            {{ store.unitName(item.unit_id) }}
                        </td>
                        <td>{{ store.projectTypeName(item.project_type_id) }}</td>
                        <td>{{ store.modeProcurementName(item.mode_procurement_id) }}</td>
                        <td>{{ store.sourceFundName(item.source_fund_id) }} {{ plan.fiscal_year }}</td>
                        <td class="text-right">{{ peso(item.amount) }}</td>
                        <td>{{ item.remarks }}</td>
                        <td>
                            <span
                                class="status badge badge-sm"
                                :class="
                                    item.status === 1
                                        ? 'badge-success'
                                        : [4, 5].includes(item.status)
                                          ? ''
                                          : 'badge-default'
                                "
                                :style="
                                    [4, 5].includes(item.status)
                                        ? 'background-color: #F7EA0A; color: #212529;'
                                        : ''
                                "
                            >
                                {{ store.itemStatusName(item.status) }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="paged.length === 0">
                        <td colspan="10" class="text-center bg-light">
                            <small class="text-muted text-uppercase">
                                No items added yet for this PPMP.
                            </small>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <AppPagination v-model="page" :last-page="lastPage" />

        <!-- Transfer a project item to another office -->
        <div
            class="modal fade"
            :class="{ show: transferring !== null }"
            :style="{ display: transferring !== null ? 'block' : 'none' }"
            tabindex="-1"
            role="dialog"
        >
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Transfer Project Item</h5>
                        <button type="button" class="close" @click="transferring = null">
                            <span>&times;</span>
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-control-label">Division/Field Office</label>
                            <select v-model.number="transfer.field_office" class="form-control">
                                <option v-for="(name, id) in fieldOfficeMap" :key="id" :value="Number(id)">
                                    {{ name }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group mb-0">
                            <label class="form-control-label">Unit</label>
                            <select v-model="transfer.unit" class="form-control">
                                <option :value="null">No unit</option>
                                <option v-for="unit in officeUnits" :key="unit.id" :value="unit.id">
                                    {{ unit.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-secondary" @click="transferring = null">
                            Cancel
                        </button>

                        <button type="button" class="btn btn-primary" @click="confirmTransfer">
                            Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="transferring !== null" class="modal-backdrop fade show"></div>
    </div>
</template>
