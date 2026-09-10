<script setup lang="ts">
import { computed } from 'vue'
import type { PpmpSubCategory } from '~/data/reference'

/** Edit a Sub-Category on the PPMP reference list. */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const store = usePpmpStore()
const modal = usePimsModal()

const id = computed(() => Number(route.params.id))
const subCategory = computed(() => store.subCategories.find((row) => row.id === id.value) ?? null)

async function save(values: Omit<PpmpSubCategory, 'id'>): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Save changes?',
        text: 'Do you want to save the changes to this Sub-Category?',
        confirmText: 'Save Changes',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.updateSubCategory(id.value, values)
    modal.success('Sub-Category updated successfully')

    await navigateTo('/PIMS/admin/PPMP/sub-categories')
}
</script>

<template>
    <div v-if="subCategory">
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            back-to="/PIMS/admin/PPMP/sub-categories"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/PPMP/sub-categories', label: 'Manage Sub-Categories' },
                { label: 'Edit Sub-Category' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Edit Sub-Category Details</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <SubCategoryForm
                                :sub-category="subCategory"
                                submit-label="Save Changes"
                                cancel-to="/PIMS/admin/PPMP/sub-categories"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Sub-Category not found" back-to="/PIMS/admin/PPMP/sub-categories" />
</template>
