<script setup lang="ts">
/**
 * What a page shows when the record in its URL is not in the demo data — a
 * mistyped id, or a row deleted in an earlier step and reached again through
 * the browser's back button.
 */
withDefaults(
    defineProps<{
        title?: string
        text?: string
        backTo: string
        backLabel?: string
    }>(),
    {
        title: 'Record not found',
        text: 'It may have been deleted, or the address may be wrong.',
        backLabel: 'Go back',
    },
)
</script>

<template>
    <div>
        <PageHeader :title="title" />

        <div class="container-fluid mt--6">
            <div class="row">
                <div class="col">
                    <div class="card">
                        <div class="card-body text-center py-5">
                            <i
                                class="ni ni-box-2 text-muted"
                                style="font-size: 3rem; opacity: 0.35"
                                aria-hidden="true"
                            ></i>

                            <h4 class="text-muted mt-3 mb-1">{{ title }}</h4>
                            <p class="text-sm text-muted mb-3">{{ text }}</p>

                            <NuxtLink :to="backTo" class="btn btn-sm btn-primary">
                                {{ backLabel }}
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
