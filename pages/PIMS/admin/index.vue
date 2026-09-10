<script setup lang="ts">
import { computed } from 'vue'

/**
 * The PIMS administration dashboard: headline figures across the top, then one
 * card per module with the way into it.
 */
definePageMeta({ layout: 'admin' })

const auth = useAuthStore()
const ppmp = usePpmpStore()
const purchaseRequests = usePurchaseRequestStore()

const prSummary = computed(() => purchaseRequests.summaryFor(auth.userId, auth.ppmpRoleId))
const ppmpSummary = computed(() => ppmp.summary)
</script>

<template>
    <div>
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            :crumbs="[{ to: '/PIMS/admin', icon: true }, { label: 'Index' }]"
        />

        <div class="container-fluid mt--6">
            <!-- Headline figures -->
            <div class="row">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats bg-gradient-orange overflow-hidden h-100">
                        <div class="card-body position-relative">
                            <i class="ni ni-cart text-white pims-stat__watermark" aria-hidden="true"></i>

                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Purchase Requests
                                    </h5>
                                    <span class="h1 font-weight-bold mb-0 text-white pims-stat__value">
                                        {{ count(prSummary.total) }}
                                    </span>
                                    <span class="pims-stat__note">
                                        {{ count(prSummary.drafts) }} still being prepared
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats bg-gradient-orange overflow-hidden h-100">
                        <div class="card-body position-relative">
                            <i
                                class="ni ni-time-alarm text-white pims-stat__watermark"
                                aria-hidden="true"
                            ></i>

                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Awaiting a Decision
                                    </h5>
                                    <span class="h1 font-weight-bold mb-0 text-white pims-stat__value">
                                        {{ count(prSummary.awaitingDecision) }}
                                    </span>
                                    <span class="pims-stat__note">
                                        {{ count(prSummary.inProgress) }} in the approval route
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats bg-gradient-orange overflow-hidden h-100">
                        <div class="card-body position-relative">
                            <i
                                class="ni ni-money-coins text-white pims-stat__watermark"
                                aria-hidden="true"
                            ></i>

                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        Requested Value
                                    </h5>
                                    <span
                                        class="h1 font-weight-bold mb-0 text-white pims-stat__value pims-stat__value--money"
                                    >
                                        {{ peso(prSummary.value) }}
                                    </span>
                                    <span class="pims-stat__note">
                                        across every Purchase Request
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats bg-gradient-orange overflow-hidden h-100">
                        <div class="card-body position-relative">
                            <i
                                class="ni ni-folder-17 text-white pims-stat__watermark"
                                aria-hidden="true"
                            ></i>

                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-0">
                                        PPMP Items
                                    </h5>
                                    <span class="h1 font-weight-bold mb-0 text-white pims-stat__value">
                                        {{ count(ppmpSummary.items) }}
                                    </span>
                                    <span class="pims-stat__note">
                                        across {{ count(ppmpSummary.total) }}
                                        {{ plural('plan', ppmpSummary.total) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <div class="card shadow-sm bg-gradient-primary text-white">
                        <div class="card-header border-0 bg-gradient-primary">
                            <h3 class="mb-0 text-white">PIMS Dashboard</h3>
                        </div>

                        <div class="card-body">
                            <div class="row">
                                <!-- Purchase Request -->
                                <div class="col-md-6 mb-4">
                                    <div class="card shadow border h-100">
                                        <div class="card-header bg-gradient-red">
                                            <h4 class="mb-0 text-white">Purchase Request</h4>
                                        </div>

                                        <div class="card-body pims-module__body">
                                            <p class="text-muted">
                                                Manage and monitor all Purchase Requests in the system.
                                            </p>

                                            <div class="pims-breakdown">
                                                <span class="pims-chip pims-chip--warning">
                                                    <span class="pims-chip__count">
                                                        {{ count(prSummary.awaitingDecision) }}
                                                    </span>
                                                    awaiting a decision
                                                </span>

                                                <span class="pims-chip">
                                                    <span class="pims-chip__count">
                                                        {{ count(prSummary.inProgress) }}
                                                    </span>
                                                    in progress
                                                </span>

                                                <span class="pims-chip pims-chip--success">
                                                    <span class="pims-chip__count">
                                                        {{ count(prSummary.approved) }}
                                                    </span>
                                                    approved
                                                </span>

                                                <span
                                                    v-if="prSummary.returned > 0"
                                                    class="pims-chip pims-chip--warning"
                                                >
                                                    <span class="pims-chip__count">
                                                        {{ count(prSummary.returned) }}
                                                    </span>
                                                    for resubmission
                                                </span>

                                                <span
                                                    v-if="prSummary.denied > 0"
                                                    class="pims-chip pims-chip--danger"
                                                >
                                                    <span class="pims-chip__count">
                                                        {{ count(prSummary.denied) }}
                                                    </span>
                                                    denied
                                                </span>
                                            </div>

                                            <div class="pims-module__actions">
                                                <NuxtLink
                                                    to="/PIMS/admin/purchase-request"
                                                    class="btn btn-primary w-100"
                                                >
                                                    Manage Purchase Requests
                                                </NuxtLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- PPMP -->
                                <div class="col-md-6 mb-4">
                                    <div class="card shadow border h-100">
                                        <div class="card-header bg-gradient-red">
                                            <h4 class="mb-0 text-white">
                                                Project Procurement Management Plan (PPMP)
                                            </h4>
                                        </div>

                                        <div class="card-body pims-module__body">
                                            <p class="text-muted">
                                                Manage Project Procurement Management Plans and its
                                                Sub-Categories.
                                            </p>

                                            <div class="pims-breakdown">
                                                <span class="pims-chip">
                                                    <span class="pims-chip__count">
                                                        {{ count(ppmpSummary.total) }}
                                                    </span>
                                                    {{ plural('plan', ppmpSummary.total) }}
                                                </span>

                                                <span class="pims-chip pims-chip--warning">
                                                    <span class="pims-chip__count">
                                                        {{ count(ppmpSummary.ongoing) }}
                                                    </span>
                                                    on-going
                                                </span>

                                                <span class="pims-chip pims-chip--success">
                                                    <span class="pims-chip__count">
                                                        {{ count(ppmpSummary.approved) }}
                                                    </span>
                                                    approved
                                                </span>

                                                <span class="pims-chip">
                                                    <span class="pims-chip__count">
                                                        {{ count(ppmpSummary.items) }}
                                                    </span>
                                                    items
                                                </span>
                                            </div>

                                            <div class="d-grid gap-2 pims-module__actions">
                                                <NuxtLink
                                                    to="/PIMS/admin/PPMP"
                                                    class="btn btn-primary w-100 mb-2"
                                                >
                                                    Manage PPMP
                                                </NuxtLink>

                                                <NuxtLink
                                                    v-if="auth.canManagePpmp"
                                                    to="/PIMS/admin/PPMP/sub-categories"
                                                    class="btn btn-primary w-100"
                                                >
                                                    Manage Sub-Categories
                                                </NuxtLink>

                                                <span
                                                    v-else
                                                    class="btn btn-primary w-100 disabled text-muted"
                                                    aria-disabled="true"
                                                >
                                                    Manage Sub-Categories
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Headline figures across the top of the dashboard */
.pims-stat__value {
    line-height: 1.2;
}

.pims-stat__value--money {
    font-size: 1.875rem;
}

.pims-stat__note {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.75);
}

/* Watermark icon behind the figure */
.pims-stat__watermark {
    position: absolute;
    right: 15px;
    top: 60%;
    transform: translateY(-50%);
    font-size: 5.5rem;
    opacity: 0.18;
    pointer-events: none;
}

/* Module cards keep their buttons level with each other */
.pims-module__body {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.pims-module__actions {
    margin-top: auto;
}

/* Status breakdown inside a module card */
.pims-breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 1.25rem;
}

.pims-chip {
    display: inline-flex;
    align-items: baseline;
    gap: 0.375rem;
    padding: 0.3125rem 0.625rem;
    border-radius: 1rem;
    background-color: #f6f9fc;
    font-size: 0.75rem;
    color: #525f7f;
}

.pims-chip__count {
    font-weight: 700;
    color: #32325d;
}

.pims-chip--warning {
    background-color: #fff3ea;
}

.pims-chip--warning .pims-chip__count {
    color: #fb6340;
}

.pims-chip--success {
    background-color: #eafaf2;
}

.pims-chip--success .pims-chip__count {
    color: #2dce89;
}

.pims-chip--danger {
    background-color: #fdeef1;
}

.pims-chip--danger .pims-chip__count {
    color: #f5365c;
}
</style>
