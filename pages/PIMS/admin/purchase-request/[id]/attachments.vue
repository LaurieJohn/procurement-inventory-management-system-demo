<script setup lang="ts">
import { computed } from 'vue'

/**
 * The documents on a Purchase Request, as the reviewing offices see them:
 * read-only, because only the requester uploads or removes them.
 */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const auth = useAuthStore()
const store = usePurchaseRequestStore()

const id = computed(() => Number(route.params.id))
/**
 * Reached by URL as easily as by link, so the same visibility rule the listing
 * applies is checked here. Out of reach reads as not found rather than as
 * forbidden, which keeps the request's existence private.
 */
const procurement = computed(() => {
    const row = store.find(id.value)

    return row && store.canView(row, auth.userId, auth.ppmpRoleId) ? row : undefined
})
</script>

<template>
    <div v-if="procurement">
        <PageHeader
            title="Purchase Request"
            :back-to="`/PIMS/admin/purchase-request/${procurement.id}`"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/purchase-request', label: 'Index' },
                { to: `/PIMS/admin/purchase-request/${procurement.id}`, label: procurement.title },
                { label: 'View Documents' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-sm-12">
                    <DocumentGrid :procurement="procurement" readonly />
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Purchase Request not found" back-to="/PIMS/admin/purchase-request" />
</template>
