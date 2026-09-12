<script setup lang="ts">
import { computed } from 'vue'

/**
 * One PPMP as the administration console sees it.
 *
 * The difference from the requester's page is visibility: every office's
 * project items are listed here, and an item can be moved to another office.
 */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const store = usePpmpStore()

const ppmpId = computed(() => Number(route.params.ppmp))
const plan = computed(() => store.findPpmp(ppmpId.value))

const items = computed(() => store.itemsFor(ppmpId.value))
const overallTotal = computed(() => store.totalAmountFor(ppmpId.value))
</script>

<template>
    <div v-if="plan">
        <PageHeader
            title="Procurement and Inventory Management System (PIMS)"
            back-to="/PIMS/admin/PPMP"
            :crumbs="[
                { to: '/PIMS/admin', icon: true },
                { to: '/PIMS/admin/PPMP', label: 'Manage PPMP' },
                { label: `View '${plan.name}'` },
            ]"
        />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col-lg-8 d-flex flex-column">
                    <PpmpDetailsCard :plan="plan" admin />

                    <div
                        class="card card-stats bg-gradient-red shadow-sm flex-grow-1 mb-4 position-relative overflow-hidden"
                    >
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col">
                                    <h5 class="card-title text-uppercase text-white mb-2">
                                        Total Number of Project Items
                                    </h5>
                                    <span class="display-2 font-weight-bold mb-0 text-white">
                                        {{ items.length }}
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
                        class="card card-stats bg-gradient-red shadow-sm flex-grow-1 mb-4 position-relative overflow-hidden"
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
                    <PpmpFieldOfficeCard :plan="plan" admin />
                </div>
            </div>

            <div class="row">
                <div class="col-lg-12">
                    <PpmpItemTable :plan="plan" :items="items" admin />
                </div>
            </div>
        </div>
    </div>

    <NotFoundCard v-else title="PPMP not found" back-to="/PIMS/admin/PPMP" />
</template>
