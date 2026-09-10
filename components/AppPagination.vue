<script setup lang="ts">
import { computed } from 'vue'

/**
 * The Argon pagination footer the paginated listings carry.
 *
 * The Laravel paginator walked the pages over the query string; here the page
 * is component state, so the links only move the model.
 */
const props = defineProps<{
    modelValue: number
    lastPage: number
}>()

const emit = defineEmits<{ 'update:modelValue': [page: number] }>()

const pages = computed(() => Array.from({ length: props.lastPage }, (_, index) => index + 1))

function go(page: number): void {
    if (page < 1 || page > props.lastPage || page === props.modelValue) {
        return
    }

    emit('update:modelValue', page)
}
</script>

<template>
    <div v-if="lastPage > 1" class="card-footer py-4">
        <nav aria-label="Pagination">
            <ul class="pagination justify-content-end mb-0">
                <li class="page-item" :class="{ disabled: modelValue === 1 }">
                    <a class="page-link" href="#" aria-label="Previous" @click.prevent="go(modelValue - 1)">
                        <i class="fas fa-angle-left"></i>
                    </a>
                </li>

                <li
                    v-for="page in pages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === modelValue }"
                >
                    <a class="page-link" href="#" @click.prevent="go(page)">{{ page }}</a>
                </li>

                <li class="page-item" :class="{ disabled: modelValue === lastPage }">
                    <a class="page-link" href="#" aria-label="Next" @click.prevent="go(modelValue + 1)">
                        <i class="fas fa-angle-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>
