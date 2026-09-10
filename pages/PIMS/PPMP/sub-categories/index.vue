<script setup lang="ts">
/** The Sub-Category reference list, read-only for the requesting offices. */
</script>

<template>
    <div>
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            back-to="/PIMS/PPMP"
            :crumbs="[{ to: '/PIMS/PPMP', icon: true }, { label: 'Sub-Categories' }]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <SubCategoryList />
                </div>
            </div>
        </div>
    </div>
</template>
