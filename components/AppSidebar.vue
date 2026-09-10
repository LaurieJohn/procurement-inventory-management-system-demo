<script setup lang="ts">
import { computed, ref, watch } from 'vue'

/**
 * The requester-facing sidebar.
 *
 * Only the Procurement and Inventory section survives: Human Resource,
 * Inspection, Knowledge Management and Cashier are not part of this demo.
 */
const route = useRoute()
const auth = useAuthStore()
const sidenav = useSidenav()

const ppmpActive = computed(() => route.path.startsWith('/PIMS/PPMP'))
const purchaseRequestActive = computed(() => route.path.startsWith('/PIMS/purchase-request'))
const sectionActive = computed(() => ppmpActive.value || purchaseRequestActive.value)

/** The section opens itself whenever the page inside it is the one on screen. */
const open = ref(sectionActive.value)

watch(sectionActive, (active) => {
    if (active) {
        open.value = true
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
                <NuxtLink to="/dashboard" class="navbar-brand p-0">
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
                    <hr class="my-3" />

                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <NuxtLink
                                to="/dashboard"
                                class="nav-link"
                                :class="{ active: route.path === '/dashboard' }"
                            >
                                <i class="ni ni-shop text-primary"></i>
                                <span class="nav-link-text">Dashboard</span>
                            </NuxtLink>
                        </li>
                    </ul>

                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a
                                class="nav-link"
                                :class="{ active: sectionActive }"
                                href="#navbar-supply"
                                role="button"
                                :aria-expanded="open"
                                @click.prevent="open = !open"
                            >
                                <i class="fa fa-truck text-warning"></i>
                                <span class="nav-link-text">Procurement and Inventory</span>
                            </a>

                            <div id="navbar-supply" class="collapse" :class="{ show: open }">
                                <ul class="nav nav-sm flex-column">
                                    <li class="nav-item">
                                        <NuxtLink
                                            to="/PIMS/PPMP"
                                            class="nav-link"
                                            :class="{ active: ppmpActive }"
                                        >
                                            <i class="ni ni-folder-17" style="color: #20befc"></i>
                                            <span>PPMP</span>
                                        </NuxtLink>

                                        <NuxtLink
                                            to="/PIMS/purchase-request"
                                            class="nav-link"
                                            :class="{ active: purchaseRequestActive }"
                                        >
                                            <i class="ni ni-cart" style="color: #0ecc4e"></i>
                                            <span>Purchase Request</span>
                                        </NuxtLink>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>

                    <hr class="my-3" />

                    <h6 class="navbar-heading p-0 text-muted">Other Functions</h6>

                    <ul class="navbar-nav mb-md-3">
                        <li v-if="auth.canAccessAdminConsole" class="nav-item">
                            <NuxtLink to="/PIMS/admin" class="nav-link">
                                <i class="ni ni-settings-gear-65 text-primary"></i>
                                <span class="nav-link-text">PIMS Administration</span>
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
</template>
