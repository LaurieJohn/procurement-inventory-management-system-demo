<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * The PIMS administration sidebar, shown on every page under /PIMS/admin.
 */
const route = useRoute()
const sidenav = useSidenav()

const ppmpAdminActive = computed(() => route.path.startsWith('/PIMS/admin/PPMP'))
const prAdminActive = computed(() => route.path.startsWith('/PIMS/admin/purchase-request'))

const ppmpOpen = ref(ppmpAdminActive.value)
const prOpen = ref(prAdminActive.value)

watch(ppmpAdminActive, (active) => {
    if (active) {
        ppmpOpen.value = true
    }
})

watch(prAdminActive, (active) => {
    if (active) {
        prOpen.value = true
    }
})
</script>

<template>
    <nav
        id="sidenav-main"
        class="sidenav navbar navbar-vertical fixed-left navbar-expand-xs navbar-light bg-white"
    >
        <div class="scrollbar-inner">
            <!-- Brand -->
            <!-- The header carries its own padding so the toggler is inset from
                 the sidebar edge instead of sitting on it. -->
            <div class="sidenav-header d-flex align-items-center px-3">
                <NuxtLink to="/PIMS/admin" class="navbar-brand p-0">
                    <AppBrand />
                </NuxtLink>

                <div class="ml-auto">
                    <!-- Sidenav toggler (compact mode) -->
                    <div class="sidenav-toggler d-none d-xl-block" @click="sidenav.toggle()">
                        <div class="sidenav-toggler-inner">
                            <i class="sidenav-toggler-line"></i>
                            <i class="sidenav-toggler-line"></i>
                            <i class="sidenav-toggler-line"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="navbar-inner">
                <div class="navbar-collapse">
                    <ul class="navbar-nav">
                        <li class="nav-item mt-5">
                            <NuxtLink
                                to="/PIMS/admin"
                                class="nav-link"
                                :class="{ active: route.path === '/PIMS/admin' }"
                            >
                                <i class="ni ni-shop text-primary"></i>
                                <span class="nav-link-text">PIMS Dashboard</span>
                            </NuxtLink>
                        </li>

                        <li class="nav-item">
                            <a
                                class="nav-link"
                                :class="{ active: ppmpAdminActive }"
                                href="#navbar-ppmp"
                                role="button"
                                :aria-expanded="ppmpOpen"
                                @click.prevent="ppmpOpen = !ppmpOpen"
                            >
                                <i class="ni ni-folder-17" style="color: #20befc"></i>
                                <span class="nav-link-text">PPMP</span>
                            </a>

                            <div id="navbar-ppmp" class="collapse" :class="{ show: ppmpOpen }">
                                <ul class="nav nav-sm flex-column">
                                    <li class="nav-item">
                                        <NuxtLink
                                            to="/PIMS/admin/PPMP"
                                            class="nav-link"
                                            :class="{
                                                active:
                                                    ppmpAdminActive &&
                                                    !route.path.includes('/sub-categories'),
                                            }"
                                        >
                                            <i class="ni ni-book-bookmark" style="color: #1489e9"></i>
                                            <span>Manage PPMP</span>
                                        </NuxtLink>
                                    </li>

                                    <li class="nav-item">
                                        <NuxtLink
                                            to="/PIMS/admin/PPMP/sub-categories"
                                            class="nav-link"
                                            :class="{ active: route.path.includes('/sub-categories') }"
                                        >
                                            <i class="ni ni-books" style="color: #f80e0e"></i>
                                            <span>Manage Sub-Categories</span>
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li class="nav-item">
                            <a
                                class="nav-link"
                                :class="{ active: prAdminActive }"
                                href="#navbar-purchase-request"
                                role="button"
                                :aria-expanded="prOpen"
                                @click.prevent="prOpen = !prOpen"
                            >
                                <i class="ni ni-cart text-success"></i>
                                <span class="nav-link-text">Purchase Request</span>
                            </a>

                            <div
                                id="navbar-purchase-request"
                                class="collapse"
                                :class="{ show: prOpen }"
                            >
                                <ul class="nav nav-sm flex-column">
                                    <li class="nav-item">
                                        <NuxtLink
                                            to="/PIMS/admin/purchase-request"
                                            class="nav-link"
                                            :class="{ active: prAdminActive }"
                                        >
                                            <i class="ni ni-basket" style="color: #1081dd"></i>
                                            <span>Manage Purchase Requests</span>
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>

                    <hr class="my-3" />

                    <h6 class="navbar-heading p-0 text-muted">Other Functions</h6>

                    <ul class="navbar-nav mb-md-3">
                        <li class="nav-item">
                            <NuxtLink to="/dashboard" class="nav-link">
                                <i class="ni ni-bold-left"></i>
                                <span class="nav-link-text">Return to Central System</span>
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
</template>
