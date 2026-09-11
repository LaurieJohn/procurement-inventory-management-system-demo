<script setup lang="ts">
/**
 * The brand-blue page header every PIMS page opens with: an optional Back
 * button, the module title, and the breadcrumb trail.
 */
export interface Crumb {
    /** Left out on the last crumb, which is the current page. */
    to?: string
    label?: string
    /** The trail always opens with a home icon rather than a word. */
    icon?: boolean
}

withDefaults(
    defineProps<{
        title: string
        crumbs?: Crumb[]
        backTo?: string
        /** Argon's spacing below the header; a few pages use pb-8. */
        padding?: string
    }>(),
    { crumbs: () => [], backTo: '', padding: 'pb-6' },
)
</script>

<template>
    <div class="header bg-primary" :class="padding">
        <div class="container-fluid">
            <div class="header-body">
                <div class="row align-items-center py-4">
                    <div class="col-12 col-lg-8">
                        <template v-if="backTo">
                            <NuxtLink :to="backTo" class="btn btn-secondary btn-sm mb-2">
                                <i class="fas fa-arrow-left"></i> Back
                            </NuxtLink>
                            <br />
                        </template>

                        <h6 class="h2 text-white d-inline-block mb-0">{{ title }}</h6>

                        <nav
                            v-if="crumbs.length"
                            aria-label="breadcrumb"
                            class="d-none d-md-inline-block ml-md-4"
                        >
                            <ol class="breadcrumb breadcrumb-links breadcrumb-dark">
                                <li
                                    v-for="(crumb, index) in crumbs"
                                    :key="index"
                                    class="breadcrumb-item"
                                    :class="{ active: index === crumbs.length - 1 }"
                                    :aria-current="index === crumbs.length - 1 ? 'page' : undefined"
                                >
                                    <NuxtLink v-if="crumb.to" :to="crumb.to">
                                        <i v-if="crumb.icon" class="fas fa-home"></i>
                                        <template v-else>{{ crumb.label }}</template>
                                    </NuxtLink>

                                    <template v-else>{{ crumb.label }}</template>
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
