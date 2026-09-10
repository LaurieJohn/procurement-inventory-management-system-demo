<script setup lang="ts">
import { computed, reactive } from 'vue'
import { fieldOfficeMap } from '~/data/reference'
import type { Ppmp } from '~/data/demo'

/**
 * The PPMP header form: what the plan is, which Division/Field Offices take
 * part, and the deadlines each office works to.
 *
 * An Indicative or Final plan is regionwide by definition, so its office list is
 * fixed; only an Updated plan picks offices.
 */
const props = defineProps<{
    plan?: Ppmp | null
    /** The detected fiscal year, type and version for a new plan. */
    detected: { fiscalYear: number; typeId: number; versionNo: string; title: string }
    selectedOffices?: number[]
    submitLabel: string
    cancelTo: string
}>()

const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const typeId = computed(() => props.plan?.type_id ?? props.detected.typeId)

/** Indicative (1) and Final (2) plans always cover every office. */
const isRegionwide = computed(() => [1, 2].includes(typeId.value))

const allOfficeIds = Object.keys(fieldOfficeMap).map(Number)

const form = reactive({
    name: props.plan?.name ?? props.detected.title,
    fiscal_year: props.plan?.fiscal_year ?? props.detected.fiscalYear,
    version_no: props.plan?.version_no ?? props.detected.versionNo,
    ppmp_deadline_at: props.plan?.ppmp_deadline_at ?? '',
    designate_deadline_at: props.plan?.designate_deadline_at ?? '',
    supply_deadline_at: props.plan?.supply_deadline_at ?? '',
    budget_deadline_at: props.plan?.budget_deadline_at ?? '',
    upload_deadline_at: props.plan?.upload_deadline_at ?? '',
    field_offices: isRegionwide.value ? [...allOfficeIds] : [...(props.selectedOffices ?? [])],
})

const typeName = computed(
    () => ({ 1: 'Indicative', 2: 'Final', 3: 'Updated' })[typeId.value] ?? 'Indicative',
)

const isComplete = computed(
    () =>
        form.name.trim() !== '' &&
        form.ppmp_deadline_at !== '' &&
        form.designate_deadline_at !== '' &&
        form.supply_deadline_at !== '' &&
        form.budget_deadline_at !== '' &&
        form.upload_deadline_at !== '' &&
        form.field_offices.length > 0,
)

function submit(): void {
    emit('submit', {
        name: form.name,
        fiscal_year: Number(form.fiscal_year),
        type_id: typeId.value,
        version_no: form.version_no,
        year_status: typeName.value,
        ppmp_deadline_at: form.ppmp_deadline_at,
        designate_deadline_at: form.designate_deadline_at,
        supply_deadline_at: form.supply_deadline_at,
        budget_deadline_at: form.budget_deadline_at,
        upload_deadline_at: form.upload_deadline_at,
        fieldOfficeIds: [...form.field_offices],
    })
}
</script>

<template>
    <form @submit.prevent="submit">
        <div class="form-row mb-3">
            <div class="col-md-12">
                <label class="form-control-label">
                    Title: <span class="text-danger">*</span>
                </label>
                <textarea v-model="form.name" class="form-control" rows="3" readonly></textarea>
            </div>
        </div>

        <div class="form-row mb-3">
            <div class="col-md-3">
                <label class="form-control-label">
                    Fiscal Year: <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control" :value="form.fiscal_year" readonly />
            </div>

            <div class="col-md-3">
                <label class="form-control-label">
                    PPMP Type: <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control" :value="typeName" readonly />
            </div>

            <div class="col-md-2">
                <label class="form-control-label">
                    Version No.: <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control" :value="form.version_no" readonly />
            </div>

            <div class="col-md-4">
                <label class="form-control-label">
                    PPMP Submission Deadline: <span class="text-danger">*</span>
                </label>
                <input v-model="form.ppmp_deadline_at" type="date" class="form-control" required />
            </div>
        </div>

        <div class="mb-3">
            <br />
            <label class="form-control-label">
                Division/Field Offices to Include: <span class="text-danger">*</span>
            </label>

            <div class="row mb-2">
                <div class="col-md-2">
                    <div class="custom-control custom-checkbox">
                        <input
                            id="regionwide"
                            class="custom-control-input"
                            type="checkbox"
                            :checked="isRegionwide"
                            :disabled="isRegionwide"
                        />
                        <label class="custom-control-label" for="regionwide">Regionwide</label>
                    </div>
                </div>

                <div v-for="(name, id) in fieldOfficeMap" :key="id" class="col-md-2">
                    <div class="custom-control custom-checkbox">
                        <input
                            :id="`office-${id}`"
                            v-model="form.field_offices"
                            class="custom-control-input"
                            type="checkbox"
                            :value="Number(id)"
                            :disabled="isRegionwide"
                        />
                        <label class="custom-control-label" :for="`office-${id}`">{{ name }}</label>
                    </div>
                </div>
            </div>

            <small v-if="isRegionwide" class="form-text text-muted">
                <i class="fas fa-lock mr-1"></i>
                An {{ typeName }} PPMP covers the whole region, so every Division and Field Office
                is included.
            </small>
        </div>

        <br />

        <div class="form-row">
            <div class="col-md-3">
                <label class="form-control-label">
                    Supply Officer Deadline: <span class="text-danger">*</span>
                </label>
                <input v-model="form.designate_deadline_at" type="date" class="form-control" required />
            </div>

            <div class="col-md-3">
                <label class="form-control-label">
                    PPMP Consolidation Deadline: <span class="text-danger">*</span>
                </label>
                <input v-model="form.supply_deadline_at" type="date" class="form-control" required />
            </div>

            <div class="col-md-3">
                <label class="form-control-label">
                    Budget Consolidation Deadline: <span class="text-danger">*</span>
                </label>
                <input v-model="form.budget_deadline_at" type="date" class="form-control" required />
            </div>

            <div class="col-md-3">
                <label class="form-control-label">
                    Updating of Documents Deadline: <span class="text-danger">*</span>
                </label>
                <input v-model="form.upload_deadline_at" type="date" class="form-control" required />
            </div>
        </div>

        <div class="card-footer bg-transparent mt-3 text-center">
            <NuxtLink :to="cancelTo" class="btn btn-secondary">Back</NuxtLink>

            <button type="submit" class="btn btn-primary" :disabled="!isComplete">
                {{ submitLabel }}
            </button>
        </div>
    </form>
</template>
