<script setup lang="ts">
import { computed } from 'vue'

/** The supporting documents a Purchase Request owes. */
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

/** A locked Purchase Request can still be read; nothing may be changed. */
const isLocked = computed(() => (procurement.value ? store.isLocked(procurement.value) : false))
</script>

<template>
    <div v-if="procurement">
        <PageHeader
            title="Purchase Request"
            :back-to="`/PIMS/purchase-request/${procurement.id}`"
            :crumbs="[
                { to: '/PIMS/purchase-request', icon: true },
                { to: '/PIMS/purchase-request', label: 'Index' },
                { to: `/PIMS/purchase-request/${procurement.id}`, label: procurement.title },
                { label: isLocked ? 'View Documents' : 'Upload Documents' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-sm-12">
                    <div v-if="isLocked" class="alert alert-warning">
                        <strong>
                            <i class="fas fa-lock mr-1"></i>
                            {{ store.statusLabel(procurement.procurement_status_id) }}.
                        </strong>

                        <span class="text-sm">
                            Documents can be viewed but not uploaded or removed. Reopen this Purchase
                            Request first to make changes.
                        </span>
                    </div>

                    <DocumentGrid :procurement="procurement" :readonly="isLocked" />
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Purchase Request not found" back-to="/PIMS/purchase-request" />
</template>
