<script setup lang="ts">
import { computed } from 'vue'
import { APPROVING_OFFICER } from '~/data/reference'

/**
 * Raise a Purchase Request.
 *
 * Creating one also opens its first lot, which is where the requester is taken
 * next — a Purchase Request with no lot has nowhere to put an item.
 */
const auth = useAuthStore()
const store = usePurchaseRequestStore()
const modal = usePimsModal()

/** The Division/Field Office Head signs the request on the office's behalf. */
const requestBy = computed(() => (auth.areaOffice?.area_office_head ?? '').toUpperCase())

async function create(values: Record<string, unknown>): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Are you sure?',
        text: 'Do you want to proceed with creating the Purchase Request?',
        confirmText: 'Create',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    const { lot } = store.create({ ...values, user_id: auth.userId } as never)

    await modal.notice({
        title: 'Purchase Request Created',
        text: 'The Purchase Request was created successfully.',
        dismissText: 'Continue',
        variant: 'success',
    })

    await navigateTo(`/PIMS/purchase-request/lots/${lot.id}`)
}
</script>

<template>
    <div>
        <PageHeader
            title="Purchase Request"
            back-to="/PIMS/purchase-request"
            :crumbs="[
                { to: '/PIMS/purchase-request', icon: true },
                { to: '/PIMS/purchase-request', label: 'Index' },
                { label: 'Create Purchase Request' },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-header pb-0">
                            <div class="d-flex align-items-center">
                                <p class="mb-0">Create Purchase Request</p>
                            </div>
                        </div>

                        <div class="card-body">
                            <PurchaseRequestForm
                                :request-by="requestBy"
                                :approved-by="APPROVING_OFFICER"
                                submit-label="Create"
                                cancel-to="/PIMS/purchase-request"
                                @submit="create"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
