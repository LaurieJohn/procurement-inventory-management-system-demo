<script setup lang="ts">
import type { PpmpSubCategory } from '~/data/reference'

/** Add a Sub-Category to the PPMP reference list. */
definePageMeta({ layout: 'admin' })

const store = usePpmpStore()
const modal = usePimsModal()

async function save(values: Omit<PpmpSubCategory, 'id'>): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Add this Sub-Category?',
        text: 'It will be available to every office encoding PPMP project items.',
        confirmText: 'Add Sub-Category',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    store.createSubCategory(values)
    modal.success('Sub-Category added successfully')

    await navigateTo('/PIMS/admin/PPMP/sub-categories')
}
</script>

<template>
    <div>
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            back-to="/PIMS/admin/PPMP/sub-categories"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/PPMP/sub-categories', label: 'Manage Sub-Categories' },
                { label: 'Add a Sub-Category' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card shadow-sm">
                        <div class="card-header pb-3">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Add a Sub-Category</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <SubCategoryForm
                                submit-label="Add Sub-Category"
                                cancel-to="/PIMS/admin/PPMP/sub-categories"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
