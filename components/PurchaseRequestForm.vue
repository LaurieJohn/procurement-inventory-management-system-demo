<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ppmpModeProcurements, prTypes } from '~/data/reference'
import { DATE_REQUIRED_PR_TYPES } from '~/stores/purchase-request'
import type { Procurement } from '~/data/demo'

/**
 * The Purchase Request details form, shared by create and edit.
 *
 * Date Required/Needed becomes mandatory for the PR types tied to an event
 * date; the ids come from the store so the form and the workflow rule cannot
 * drift apart.
 */
const props = withDefaults(
    defineProps<{
        procurement?: Procurement | null
        requestBy: string
        approvedBy: string
        submitLabel: string
        cancelTo: string
        /**
         * The PR Type decides which documents are required and which approval
         * route the request takes, so it is fixed once the request has been
         * submitted.
         */
        canChangePrType?: boolean
    }>(),
    { procurement: null, canChangePrType: true },
)

const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const form = reactive({
    request_by: props.procurement?.request_by ?? props.requestBy,
    approved_by: props.procurement?.approved_by ?? props.approvedBy,
    title: props.procurement?.title ?? '',
    mode_of_procurement_id: props.procurement?.mode_of_procurement_id ?? ('' as number | ''),
    pr_type_id: props.procurement?.pr_type_id ?? ('' as number | ''),
    description: props.procurement?.description ?? '',
    date: props.procurement?.date ?? today(),
    date_required: props.procurement?.date_required ?? '',
})

const dateRequiredIsMandatory = computed(() =>
    DATE_REQUIRED_PR_TYPES.includes(Number(form.pr_type_id)),
)

const prTypeName = computed(
    () => prTypes.find((row) => row.id === Number(form.pr_type_id))?.name ?? 'Not set',
)

/** Which required fields are still empty, so they can be highlighted at once. */
const missing = computed(() => {
    const fields: string[] = []

    if (!form.request_by.trim()) fields.push('request_by')
    if (!form.title.trim()) fields.push('title')
    if (form.mode_of_procurement_id === '') fields.push('mode_of_procurement_id')
    if (form.pr_type_id === '') fields.push('pr_type_id')
    if (!form.description.trim()) fields.push('description')
    if (!form.date) fields.push('date')
    if (dateRequiredIsMandatory.value && !form.date_required) fields.push('date_required')

    return fields
})

const modal = usePimsModal()

async function submit(): Promise<void> {
    if (missing.value.length > 0) {
        await modal.notice({
            title: 'Required Fields Missing',
            text: 'Please fill in all required fields before proceeding.',
        })

        return
    }

    emit('submit', {
        request_by: form.request_by,
        approved_by: form.approved_by,
        title: form.title,
        mode_of_procurement_id: Number(form.mode_of_procurement_id),
        pr_type_id: Number(form.pr_type_id),
        description: form.description,
        date: form.date,
        date_required: form.date_required || null,
    })
}
</script>

<template>
    <form novalidate @submit.prevent="submit">
        <div class="row">
            <div class="col-sm-6">
                <div class="form-group">
                    <label class="form-control-label">Requested by:</label>

                    <div class="input-group input-group-merge">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><i class="fas fa-user"></i></span>
                        </div>

                        <input
                            v-model="form.request_by"
                            class="form-control"
                            :class="{ highlight: missing.includes('request_by') }"
                            type="text"
                            :readonly="!procurement"
                        />
                    </div>
                </div>
            </div>

            <div class="col-sm-6">
                <div class="form-group">
                    <label class="form-control-label">Approved by:</label>

                    <div class="input-group input-group-merge">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><i class="fas fa-user"></i></span>
                        </div>

                        <input v-model="form.approved_by" class="form-control" type="text" readonly />
                    </div>
                </div>
            </div>

            <div class="col-sm-12">
                <h3>Purpose</h3>
            </div>

            <div class="col-sm-12">
                <div class="form-group">
                    <label class="form-control-label">Title of Proposal / Procurement:</label>

                    <div class="input-group input-group-merge">
                        <div class="input-group-prepend">
                            <span class="input-group-text"><i class="ni ni-tag"></i></span>
                        </div>

                        <input
                            v-model="form.title"
                            class="form-control"
                            :class="{ highlight: missing.includes('title') }"
                            type="text"
                        />
                    </div>
                </div>
            </div>

            <div class="col-sm-6">
                <div class="form-group">
                    <label class="form-control-label">Mode of Procurement:</label>

                    <div class="select-group select-group-merge">
                        <select
                            v-model="form.mode_of_procurement_id"
                            class="form-control"
                            :class="{ highlight: missing.includes('mode_of_procurement_id') }"
                        >
                            <option value="" disabled>Select Mode of Procurement</option>
                            <option v-for="mode in ppmpModeProcurements" :key="mode.id" :value="mode.id">
                                {{ mode.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="col-sm-6">
                <div class="form-group">
                    <label class="form-control-label">PR Type:</label>

                    <div v-if="canChangePrType" class="select-group select-group-merge">
                        <select
                            v-model="form.pr_type_id"
                            class="form-control"
                            :class="{ highlight: missing.includes('pr_type_id') }"
                        >
                            <option value="" disabled>Select PR Type</option>
                            <option v-for="prType in prTypes" :key="prType.id" :value="prType.id">
                                {{ prType.name }}
                            </option>
                        </select>
                    </div>

                    <template v-else>
                        <input type="text" class="form-control" :value="prTypeName" readonly disabled />

                        <small class="form-text text-muted">
                            <i class="fas fa-lock mr-1"></i>
                            The PR Type is fixed once a Purchase Request has been submitted. It can
                            only be replaced while the request is still in the Created status.
                        </small>
                    </template>
                </div>
            </div>

            <div class="col-sm-12">
                <div class="form-group">
                    <label class="form-control-label">Description:</label>

                    <textarea
                        v-model="form.description"
                        class="form-control"
                        :class="{ highlight: missing.includes('description') }"
                        rows="5"
                    ></textarea>
                </div>
            </div>

            <div class="col-sm-6">
                <div class="form-group">
                    <label class="form-control-label">Date of Purchase Request Created:</label>

                    <input
                        v-model="form.date"
                        class="form-control"
                        :class="{ highlight: missing.includes('date') }"
                        type="date"
                    />
                </div>
            </div>

            <div class="col-sm-6">
                <div class="form-group">
                    <label class="form-control-label" for="date_required">
                        Date Required/Needed
                        <span :class="dateRequiredIsMandatory ? 'text-danger' : 'text-muted'">
                            ({{ dateRequiredIsMandatory ? 'Required' : 'Optional' }})
                        </span>
                    </label>

                    <input
                        id="date_required"
                        v-model="form.date_required"
                        class="form-control"
                        :class="{ highlight: missing.includes('date_required') }"
                        type="date"
                    />
                </div>
            </div>
        </div>

        <div class="text-center card-footer bg-transparent mt-5">
            <NuxtLink :to="cancelTo" class="btn btn-secondary">Back</NuxtLink>

            <button type="submit" class="btn btn-primary">{{ submitLabel }}</button>
        </div>
    </form>
</template>
