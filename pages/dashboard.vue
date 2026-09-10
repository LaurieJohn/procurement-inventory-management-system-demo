<script setup lang="ts">
import { computed } from 'vue'

/**
 * The landing page.
 *
 * The Central System dashboard listed every module the account could reach.
 * This build ships one — PIMS — so the page opens straight onto its two
 * features and the figures behind them.
 */
const auth = useAuthStore()
const ppmp = usePpmpStore()
const purchaseRequests = usePurchaseRequestStore()

const prSummary = computed(() => purchaseRequests.summary)
const ppmpSummary = computed(() => ppmp.summary)

const today = computed(() =>
    new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    }),
)

const modules = [
    {
        slug: 'PPMP',
        name: 'Project Procurement Management Plan',
        to: '/PIMS/PPMP',
        icon: 'fa-folder-open',
        bg: 'bg-gradient-orange',
        hex: '#fb6340',
    },
    {
        slug: 'Purchase Request',
        name: 'Raise and track Purchase Requests',
        to: '/PIMS/purchase-request',
        icon: 'fa-shopping-cart',
        bg: 'bg-gradient-green',
        hex: '#2dce89',
    },
]
</script>

<template>
    <div>
        <div class="header pb-8" style="background-color: #0038a8">
            <div class="container-fluid">
                <div class="header-body">
                    <div class="row align-items-center py-4">
                        <div class="col-lg-6 col-7">
                            <h6 class="h2 text-white d-inline-block mb-0">Dashboard</h6>
                            <nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
                                <ol class="breadcrumb breadcrumb-links breadcrumb-dark">
                                    <li class="breadcrumb-item">
                                        <NuxtLink to="/dashboard"><i class="fas fa-home"></i></NuxtLink>
                                    </li>
                                    <li class="breadcrumb-item active">Home</li>
                                </ol>
                            </nav>
                        </div>

                        <div class="col-lg-6 col-5 text-right">
                            <span class="text-white-50 text-sm">{{ today }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container-fluid mt--7">
            <!-- System modules -->
            <div class="row mb-4">
                <div class="col-12 mb-2">
                    <h6
                        class="text-uppercase text-white ls-1 mb-0"
                        style="font-size: 0.7rem; letter-spacing: 0.08em"
                    >
                        <i class="fas fa-th mr-1"></i> System Modules
                    </h6>
                </div>

                <div v-for="mod in modules" :key="mod.slug" class="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <NuxtLink :to="mod.to" class="text-decoration-none">
                        <div class="card shadow h-100">
                            <div class="card-body p-3 d-flex align-items-start">
                                <div
                                    class="icon icon-shape text-white rounded-circle shadow mr-3 flex-shrink-0"
                                    :class="mod.bg"
                                    style="
                                        width: 46px;
                                        height: 46px;
                                        min-width: 46px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                    "
                                >
                                    <i class="fas" :class="mod.icon" style="font-size: 1.1rem"></i>
                                </div>

                                <div class="overflow-hidden">
                                    <h5
                                        class="mb-0 text-dark font-weight-bold"
                                        style="font-size: 0.9rem"
                                    >
                                        {{ mod.slug.toUpperCase() }}
                                    </h5>
                                    <p
                                        class="text-muted mb-0"
                                        style="font-size: 0.72rem; line-height: 1.4; margin-top: 2px"
                                    >
                                        {{ mod.name }}
                                    </p>
                                </div>
                            </div>

                            <div
                                class="card-footer py-3 px-3 border-0 d-flex align-items-center justify-content-between"
                                style="background: transparent"
                            >
                                <small
                                    class="font-weight-bold"
                                    :style="{ color: mod.hex }"
                                    style="
                                        font-size: 0.7rem;
                                        text-transform: uppercase;
                                        letter-spacing: 0.05em;
                                    "
                                >
                                    Open Module
                                </small>
                                <i class="fas fa-arrow-right" :style="{ color: mod.hex, fontSize: '.7rem' }"></i>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </div>

            <!-- Headline figures -->
            <div class="row">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats h-100">
                        <div class="card-body">
                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-muted mb-0">
                                        Purchase Requests
                                    </h5>
                                    <span class="h2 font-weight-bold mb-0">
                                        {{ count(prSummary.total) }}
                                    </span>
                                </div>
                                <div class="col-auto">
                                    <div
                                        class="icon icon-shape bg-gradient-orange text-white rounded-circle shadow"
                                    >
                                        <i class="ni ni-cart"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-3 mb-0 text-sm text-muted">
                                {{ count(prSummary.drafts) }} still being prepared
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats h-100">
                        <div class="card-body">
                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-muted mb-0">
                                        Awaiting a Decision
                                    </h5>
                                    <span class="h2 font-weight-bold mb-0">
                                        {{ count(prSummary.awaitingDecision) }}
                                    </span>
                                </div>
                                <div class="col-auto">
                                    <div
                                        class="icon icon-shape bg-gradient-warning text-white rounded-circle shadow"
                                    >
                                        <i class="ni ni-time-alarm"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-3 mb-0 text-sm text-muted">
                                {{ count(prSummary.inProgress) }} in the approval route
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats h-100">
                        <div class="card-body">
                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-muted mb-0">
                                        Requested Value
                                    </h5>
                                    <span class="h2 font-weight-bold mb-0">
                                        {{ peso(prSummary.value) }}
                                    </span>
                                </div>
                                <div class="col-auto">
                                    <div
                                        class="icon icon-shape bg-gradient-green text-white rounded-circle shadow"
                                    >
                                        <i class="ni ni-money-coins"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-3 mb-0 text-sm text-muted">
                                across every Purchase Request
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card card-stats h-100">
                        <div class="card-body">
                            <div class="row">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-muted mb-0">
                                        PPMP Items
                                    </h5>
                                    <span class="h2 font-weight-bold mb-0">
                                        {{ count(ppmpSummary.items) }}
                                    </span>
                                </div>
                                <div class="col-auto">
                                    <div
                                        class="icon icon-shape bg-gradient-info text-white rounded-circle shadow"
                                    >
                                        <i class="ni ni-folder-17"></i>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-3 mb-0 text-sm text-muted">
                                across {{ count(ppmpSummary.total) }}
                                {{ plural('plan', ppmpSummary.total) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Signed-in account -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header border-0">
                            <h3 class="mb-0">Signed in as</h3>
                            <p class="text-sm text-muted mb-0">
                                PIMS pages change with the viewer's PPMP role. Switch accounts from
                                the menu in the top right to see the system as another office.
                            </p>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-items-center table-flush">
                                <thead class="thead-light">
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">PPMP Role</th>
                                        <th scope="col">Division/Field Office</th>
                                        <th scope="col">Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{{ auth.user.name }}</td>
                                        <td>
                                            <span class="badge badge-lg badge-primary">
                                                {{ auth.ppmpRoleName }}
                                            </span>
                                        </td>
                                        <td>{{ auth.areaOffice?.name ?? '-' }}</td>
                                        <td>{{ auth.officeUnitName }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
