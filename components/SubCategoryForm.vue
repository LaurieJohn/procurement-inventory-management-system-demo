<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ppmpCategories, ppmpProjectTypes, type PpmpSubCategory } from '~/data/reference'

/** The Sub-Category form, shared by the add and edit pages. */
const props = defineProps<{
    subCategory?: PpmpSubCategory | null
    submitLabel: string
    cancelTo: string
}>()

const emit = defineEmits<{ submit: [values: Omit<PpmpSubCategory, 'id'>] }>()

const form = reactive({
    name: props.subCategory?.name ?? '',
    category_id: props.subCategory?.category_id ?? ('' as number | ''),
    project_type_id: props.subCategory?.project_type_id ?? ('' as number | ''),
})

const isComplete = computed(
    () => form.name.trim() !== '' && form.category_id !== '' && form.project_type_id !== '',
)

function submit(): void {
    emit('submit', {
        name: form.name,
        category_id: Number(form.category_id),
        project_type_id: Number(form.project_type_id),
    })
}
</script>

<template>
    <form @submit.prevent="submit">
        <div class="form-group">
            <label class="form-control-label">
                Sub-Category Name <span class="text-danger">*</span>
            </label>
            <textarea v-model="form.name" class="form-control" rows="3" required></textarea>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-control-label">
                        Category <span class="text-danger">*</span>
                    </label>
                    <select v-model="form.category_id" class="form-control" required>
                        <option value="">-- Select Category --</option>
                        <option v-for="category in ppmpCategories" :key="category.id" :value="category.id">
                            <template v-if="category.id <= 12">
                                {{ String.fromCharCode(64 + category.id) }}.
                            </template>
                            {{ category.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-control-label">
                        Project Type <span class="text-danger">*</span>
                    </label>
                    <select v-model="form.project_type_id" class="form-control" required>
                        <option value="">-- Select Project Type --</option>
                        <option v-for="type in ppmpProjectTypes" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <div class="text-center card-footer bg-transparent mt-3">
            <NuxtLink :to="cancelTo" class="btn btn-secondary">Back</NuxtLink>

            <button type="submit" class="btn btn-primary" :disabled="!isComplete">
                {{ submitLabel }}
            </button>
        </div>
    </form>
</template>
