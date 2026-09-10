<script setup lang="ts">
import { computed } from 'vue'

// The officer review pages belong to the PIMS administration console, so they
// carry its sidebar rather than the requester's.
definePageMeta({ layout: 'admin' })

/** The Budget Officer's review of a Purchase Request's items. */
const route = useRoute()
const store = usePurchaseRequestStore()

const id = computed(() => Number(route.params.id))
const procurement = computed(() => store.find(id.value))
</script>

<template>
    <div v-if="procurement">
        <PageHeader
            title="Purchase Request"
            :back-to="`/PIMS/admin/purchase-request/${procurement.id}`"
            :crumbs="[
                { to: '/PIMS/admin/purchase-request', icon: true },
                {
                    to: `/PIMS/admin/purchase-request/${procurement.id}`,
                    label: procurement.title,
                },
                { label: 'Budget Officer Review' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <PrOfficerReview :procurement="procurement" office="budget" />
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Purchase Request not found" back-to="/PIMS/admin/purchase-request" />
</template>
