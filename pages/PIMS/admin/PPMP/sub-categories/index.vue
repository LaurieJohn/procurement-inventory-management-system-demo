<script setup lang="ts">
/** The Sub-Category reference list, with the admin actions on each row. */
definePageMeta({ layout: 'admin' })
</script>

<template>
    <div>
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            back-to="/PIMS/admin"
            :crumbs="[{ to: '/PIMS/admin', icon: true }, { label: 'Manage Sub-Categories' }]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <SubCategoryList manageable />
                </div>
            </div>
        </div>
    </div>
</template>
