<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ppmpCategories, ppmpProjectTypes } from '~/data/reference'

/**
 * The Sub-Category listing with its filters.
 *
 * The requester-facing page reads it; the admin page passes `manageable` and
 * gets the Actions column and the Add button with it.
 */
const props = withDefaults(
    defineProps<{
        /** Show the Actions column and the Add button. */
        manageable?: boolean
        /** Where the Add and Edit links point. */
        basePath?: string
    }>(),
    { manageable: false, basePath: '/PIMS/admin/PPMP/sub-categories' },
)

const store = usePpmpStore()
const modal = usePimsModal()

const filters = reactive({ category: '' as number | '', project_type: '' as number | '', search: '' })
const page = ref(1)
const perPage = 15

const filtered = computed(() =>
    store.subCategories.filter((row) => {
        if (filters.category !== '' && row.category_id !== Number(filters.category)) {
            return false
        }

        if (filters.project_type !== '' && row.project_type_id !== Number(filters.project_type)) {
            return false
        }

        if (filters.search && !row.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false
        }

        return true
    }),
)

const lastPage = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const paged = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))

function clearFilters(): void {
    filters.category = ''
    filters.project_type = ''
    filters.search = ''
    page.value = 1
}

async function confirmDelete(id: number): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Delete Sub-Category?',
        text: "You won't be able to revert this action.",
        confirmText: 'Delete',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.deleteSubCategory(id)
    modal.success('Sub-Category deleted successfully')
}

/** Categories 1–12 are lettered on the official form; the last two are not. */
function categoryLabel(id: number, name: string): string {
    return id <= 12 ? `${String.fromCharCode(64 + id)}. ${name}` : name
}
</script>

<template>
    <div class="card shadow-sm">
        <div class="card-header pb-3 d-flex align-items-center justify-content-between">
            <p class="mb-0">List of all current Sub-Categories</p>

            <NuxtLink v-if="props.manageable" :to="`${props.basePath}/create`" class="btn btn-success">
                Add a Sub-Category <i class="fas fa-plus mr-1"></i>
            </NuxtLink>
        </div>

        <div class="card">
            <div class="card-header border-0">
                <form class="w-100" @submit.prevent="page = 1">
                    <div class="mb-2">
                        <label class="mb-1"><strong>Filter by:</strong></label>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-2">
                                <label class="small mb-1"><strong>Category:</strong></label>
                                <select v-model="filters.category" class="form-control w-100">
                                    <option value="">All Categories</option>
                                    <option
                                        v-for="category in ppmpCategories"
                                        :key="category.id"
                                        :value="category.id"
                                    >
                                        {{ categoryLabel(category.id, category.name) }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group mb-2">
                                <label class="small mb-1"><strong>Project Type:</strong></label>
                                <select v-model="filters.project_type" class="form-control w-100">
                                    <option value="">All Project Types</option>
                                    <option v-for="type in ppmpProjectTypes" :key="type.id" :value="type.id">
                                        {{ type.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-group mb-2">
                                <label class="small mb-1"><strong>Sub-Category Name:</strong></label>
                                <input
                                    v-model="filters.search"
                                    type="text"
                                    class="form-control w-100"
                                    placeholder="Search by Sub-Category Name"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="d-flex w-100">
                        <div class="ml-auto d-flex flex-column" style="width: 500px">
                            <button type="submit" class="btn btn-default mb-2 w-100">Apply Filter</button>

                            <button
                                type="button"
                                class="btn btn-secondary mb-2 w-100"
                                @click="clearFilters"
                            >
                                Clear Filter
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="table-responsive mt-2">
                <table class="table align-items-center table-flush">
                    <thead class="thead-light">
                        <tr>
                            <th v-if="props.manageable" scope="col" style="width: 50px">Actions</th>
                            <th>Sub-Category Name</th>
                            <th>Category</th>
                            <th>Project Type</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="subCategory in paged" :key="subCategory.id">
                            <td v-if="props.manageable" class="text-center">
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
                                        :to="`${props.basePath}/${subCategory.id}/edit`"
                                    >
                                        Edit Sub-Category Details
                                    </NuxtLink>

                                    <div class="dropdown-divider"></div>

                                    <button
                                        type="button"
                                        class="dropdown-item text-danger"
                                        @click="confirmDelete(subCategory.id)"
                                    >
                                        Delete
                                    </button>
                                </AppDropdown>
                            </td>

                            <td class="text-wrap">{{ subCategory.name }}</td>
                            <td>{{ store.categoryName(subCategory.category_id) }}</td>
                            <td>{{ store.projectTypeName(subCategory.project_type_id) }}</td>
                        </tr>

                        <tr v-if="paged.length === 0">
                            <td :colspan="props.manageable ? 4 : 3" class="text-center text-muted py-4">
                                No sub-categories found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <AppPagination v-model="page" :last-page="lastPage" />
        </div>
    </div>
</template>
