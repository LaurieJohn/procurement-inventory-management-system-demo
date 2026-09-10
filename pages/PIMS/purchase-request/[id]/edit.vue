<script setup lang="ts">
import { computed } from 'vue'
import { APPROVING_OFFICER } from '~/data/reference'

/** Edit a Purchase Request's details. */
const route = useRoute()
const auth = useAuthStore()
const store = usePurchaseRequestStore()
const modal = usePimsModal()

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

const isLocked = computed(() => (procurement.value ? store.isLocked(procurement.value) : false))

async function save(values: Record<string, unknown>): Promise<void> {
    if (!procurement.value) {
        return
    }

    const confirmed = await modal.confirm({
        title: 'Save changes?',
        text: 'Do you want to save the changes to this Purchase Request?',
        confirmText: 'Save Changes',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    // The PR Type is not posted once it is fixed, so a locked one keeps its value.
    const changes = store.canChangePrType(procurement.value)
        ? values
        : { ...values, pr_type_id: procurement.value.pr_type_id }

    store.update(id.value, changes as never)
    modal.success('Purchase Request updated successfully')

    await navigateTo(`/PIMS/purchase-request/${id.value}`)
}
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
                { label: 'Edit Details' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div v-if="isLocked" class="row">
                <div class="col-12">
                    <div class="alert alert-warning">
                        <strong>
                            <i class="fas fa-lock mr-1"></i>
                            {{ store.statusLabel(procurement.procurement_status_id) }}.
                        </strong>

                        <span class="text-sm">
                            This Purchase Request can no longer be changed. Reopen it from its page
                            first to be able to edit.
                        </span>

                        <NuxtLink
                            :to="`/PIMS/purchase-request/${procurement.id}`"
                            class="alert-link text-sm"
                        >
                            Go to the Purchase Request
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div v-else class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-header pb-0">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Edit Purchase Request</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <PurchaseRequestForm
                                :procurement="procurement"
                                :request-by="procurement.request_by"
                                :approved-by="procurement.approved_by || APPROVING_OFFICER"
                                :can-change-pr-type="store.canChangePrType(procurement)"
                                submit-label="Save Changes"
                                :cancel-to="`/PIMS/purchase-request/${procurement.id}`"
                                @submit="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="Purchase Request not found" back-to="/PIMS/purchase-request" />
</template>
