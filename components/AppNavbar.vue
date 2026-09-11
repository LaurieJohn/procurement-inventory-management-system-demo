<script setup lang="ts">
import { ppmpRoles } from '~/data/reference'

/**
 * The top bar.
 *
 * The account menu doubles as the demo's role switcher: PIMS pages read the
 * viewer's PPMP role to decide what they offer, and with no login there has to
 * be some way to look at the system as each office.
 */
const auth = useAuthStore()
const sidenav = useSidenav()

/** The role line under each account in the switcher. */
function roleLabel(roleId: number, isSuperAdmin: boolean): string {
    if (isSuperAdmin) {
        return 'Super Admin'
    }

    return ppmpRoles.find((role) => role.id === roleId)?.name ?? 'Employee'
}
</script>

<template>
    <nav
        class="navbar navbar-top navbar-expand navbar-dark border-bottom"
        style="background: #0038a8 !important"
    >
        <div class="container-fluid">
            <div class="collapse navbar-collapse">
                <!-- The only toggler that is always reachable: the sidebar takes
                     its own one off-canvas with it when it closes. -->
                <div
                    class="sidenav-toggler sidenav-toggler-dark mr-3"
                    role="button"
                    tabindex="0"
                    aria-label="Toggle the sidebar"
                    @click="sidenav.toggle()"
                    @keydown.enter.prevent="sidenav.toggle()"
                    @keydown.space.prevent="sidenav.toggle()"
                >
                    <div class="sidenav-toggler-inner">
                        <i class="sidenav-toggler-line"></i>
                        <i class="sidenav-toggler-line"></i>
                        <i class="sidenav-toggler-line"></i>
                    </div>
                </div>

                <!-- Search form -->
                <form class="navbar-search navbar-search-light form-inline mr-sm-3" @submit.prevent>
                    <div class="form-group mb-0">
                        <div class="input-group input-group-alternative input-group-merge">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                            </div>
                            <input class="form-control" placeholder="Search" type="text" />
                        </div>
                    </div>
                </form>

                <ul class="navbar-nav align-items-center ml-md-auto">
                    <li class="nav-item">
                        <AppDropdown align-right>
                            <template #trigger="{ toggle }">
                                <a class="nav-link" href="#" role="button" @click.prevent="toggle">
                                    <i class="ni ni-bell-55"></i>
                                </a>
                            </template>

                            <div class="px-3 py-4 text-center" style="min-width: 16rem">
                                <i
                                    class="ni ni-bell-55 text-muted d-block mb-2"
                                    style="font-size: 1.75rem"
                                ></i>
                                <h6 class="text-sm font-weight-bold mb-1">Notifications</h6>
                                <p class="text-xs text-muted mb-0">Coming soon.</p>
                            </div>
                        </AppDropdown>
                    </li>
                </ul>

                <ul class="navbar-nav align-items-center ml-auto ml-md-0">
                    <li class="nav-item">
                        <AppDropdown align-right>
                            <template #trigger="{ toggle }">
                                <a class="nav-link pr-0" href="#" role="button" @click.prevent="toggle">
                                    <div class="media align-items-center">
                                        <div
                                            class="rounded-circle bg-gradient-primary d-inline-flex align-items-center justify-content-center"
                                            style="width: 40px; height: 40px"
                                        >
                                            <span
                                                class="text-white font-weight-bold"
                                                style="font-size: 1.2rem"
                                            >
                                                {{ auth.initials }}
                                            </span>
                                        </div>

                                        <div class="media-body ml-2 d-none d-lg-block">
                                            <span class="mb-0 text-sm font-weight-bold">
                                                {{ auth.user.name }}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            </template>

                            <div class="dropdown-header noti-title">
                                <h6 class="text-overflow m-0">Welcome! {{ auth.user.name }}</h6>
                                <span class="text-xs text-muted">
                                    {{ auth.ppmpRoleName }} &mdash; {{ auth.areaOfficeName }}
                                </span>
                            </div>

                            <div class="dropdown-divider"></div>

                            <h6 class="dropdown-header text-muted">Sign in as</h6>

                            <a
                                v-for="account in auth.accounts"
                                :key="account.id"
                                href="#"
                                class="dropdown-item"
                                @click.prevent="auth.signInAs(account.id)"
                            >
                                <i
                                    class="ni"
                                    :class="
                                        account.id === auth.userId
                                            ? 'ni-check-bold text-primary'
                                            : 'ni-single-02'
                                    "
                                ></i>

                                <span :class="{ 'font-weight-bold': account.id === auth.userId }">
                                    {{ account.name }}
                                    <small class="text-muted d-block">
                                        {{ roleLabel(account.ppmp_role_id, account.is_super_admin) }}
                                    </small>
                                </span>
                            </a>
                        </AppDropdown>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>
