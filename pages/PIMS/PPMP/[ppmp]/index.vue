<script setup lang="ts">
import { computed } from 'vue'

/**
 * One PPMP as its own office sees it: the plan's details, the standing of every
 * participating Division/Field Office, and the project items the signed-in user
 * encoded.
 *
 * Broader, role-based visibility over everyone's items lives on the admin page
 * at /PIMS/admin/PPMP/{ppmp}.
 */
const route = useRoute()
const auth = useAuthStore()
const store = usePpmpStore()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))

/** On this page every user sees only the items they encoded themselves. */
const ownItems = computed(() =>
    store.itemsFor(ppmpId.value).filter((item) => item.user_id === auth.userId),
)

const overallTotal = computed(() => store.totalAmountFor(ppmpId.value))
</script>

<template>
    <div v-if="plan">
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            back-to="/PIMS/PPMP"
            :crumbs="[{ to: '/PIMS/PPMP', icon: true }, { label: `View '${plan.name}'` }]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-lg-8 d-flex flex-column">
                    <PpmpDetailsCard :plan="plan" />

                    <div
                        class="card card-stats bg-gradient-blue shadow-sm flex-grow-1 mb-4 position-relative overflow-hidden"
                    >
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-2">
                                        Total Number of Project Items
                                    </h5>
                                    <span class="display-2 font-weight-bold mb-0 text-white">
                                        {{ ownItems.length }}
                                    </span>
                                </div>
                            </div>

                            <i
                                class="ni ni-single-copy-04 text-white position-absolute"
                                style="font-size: 8rem; right: 10px; bottom: -15px; opacity: 0.25"
                                aria-hidden="true"
                            ></i>
                        </div>
                    </div>

                    <div
                        class="card card-stats bg-gradient-blue shadow-sm flex-grow-1 mb-4 position-relative overflow-hidden"
                    >
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-2">
                                        Total Amount
                                    </h5>
                                    <span class="display-2 font-weight-bold mb-0 text-white">
                                        {{ peso(overallTotal) }}
                                    </span>
                                </div>
                            </div>

                            <i
                                class="ni ni-money-coins text-white position-absolute"
                                style="font-size: 8rem; right: 10px; bottom: -15px; opacity: 0.25"
                                aria-hidden="true"
                            ></i>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <PpmpFieldOfficeCard :plan="plan" />
                </div>
            </div>

            <div class="row">
                <div class="col-lg-12">
                    <PpmpItemTable :plan="plan" :items="ownItems" />
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="PPMP not found" back-to="/PIMS/PPMP" />
</template>
