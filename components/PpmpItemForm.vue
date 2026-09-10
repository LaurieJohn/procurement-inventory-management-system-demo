<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
    ppmpCategories,
    ppmpModeProcurements,
    ppmpProjectTypes,
    ppmpSourceFunds,
    quantityTypes,
} from '~/data/reference'
import type { PpmpItem } from '~/data/demo'

/**
 * The PPMP Project Item form, shared by the create and edit pages on both the
 * requester and the admin side.
 *
 * The column numbers in the headings are the columns of the official PPMP form;
 * they were on the Blade version and encoders navigate by them.
 */
const props = defineProps<{
    /** The item being edited, or null when adding a new one. */
    item?: PpmpItem | null
    fiscalYear: number
    /** Source of Funds is fixed by the plan, so the select is display-only. */
    sourceFundId: number
    submitLabel: string
    cancelTo: string
}>()

const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const store = usePpmpStore()

const form = reactive({
    title: props.item?.title ?? '',
    category_id: props.item?.category_id ?? ('' as number | ''),
    sub_category_id: props.item?.sub_category_id ?? ('' as number | ''),
    quantity: props.item?.quantity ?? '',
    quantity_type: props.item?.quantity_type ?? ('' as number | ''),
    pre_procurement_status: props.item ? (props.item.pre_procurement_status ? '1' : '0') : '',
    project_type_id: props.item?.project_type_id ?? ('' as number | ''),
    amount: props.item?.amount ?? ('' as number | ''),
    mode_procurement_id: props.item?.mode_procurement_id ?? ('' as number | ''),
    start_date: props.item?.start_date ?? '',
    end_date: props.item?.end_date ?? '',
    expected_date: props.item?.expected_date ?? '',
    attached_documents: props.item?.attached_documents ?? '',
    remarks: props.item?.remarks ?? '',
})

/** Sub-categories narrow to the chosen category, as the page's script did. */
const availableSubCategories = computed(() =>
    form.category_id === '' ? [] : store.subCategoriesFor(Number(form.category_id)),
)

watch(
    () => form.category_id,
    () => {
        if (
            form.sub_category_id !== '' &&
            !availableSubCategories.value.some((row) => row.id === Number(form.sub_category_id))
        ) {
            form.sub_category_id = ''
        }
    },
)

/**
 * Picking a sub-category fixes the Project Type: the two are paired on the
 * reference list, so the field follows rather than being answered twice.
 */
watch(
    () => form.sub_category_id,
    (id) => {
        if (id === '') {
            return
        }

        const subCategory = store.subCategories.find((row) => row.id === Number(id))

        if (subCategory) {
            form.project_type_id = subCategory.project_type_id
        }
    },
)

/** Every required field answered — the submit button stays disabled until then. */
const isComplete = computed(() =>
    [
        form.title,
        form.category_id,
        form.sub_category_id,
        form.quantity,
        form.quantity_type,
        form.pre_procurement_status,
        form.project_type_id,
        form.amount,
        form.mode_procurement_id,
        form.start_date,
    ].every((value) => value !== '' && value !== null),
)

/** The projected timeline is bounded by the plan's fiscal year. */
const monthMin = computed(() => `${props.fiscalYear - 1}-01`)
const monthMax = computed(() => `${props.fiscalYear}-12`)

function submit(): void {
    emit('submit', {
        title: form.title,
        category_id: Number(form.category_id),
        sub_category_id: Number(form.sub_category_id),
        quantity: form.quantity,
        quantity_type: Number(form.quantity_type),
        pre_procurement_status: form.pre_procurement_status === '1',
        project_type_id: Number(form.project_type_id),
        amount: Number(form.amount),
        mode_procurement_id: Number(form.mode_procurement_id),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        expected_date: form.expected_date || null,
        source_fund_id: props.sourceFundId,
        attached_documents: form.attached_documents || null,
        remarks: form.remarks || null,
    })
}
</script>

<template>
    <form @submit.prevent="submit">
        <h3 class="mb--3">Procurement Project Details</h3>

        <div class="row">
            <div class="col-md-12">
                <h6 class="mt-4">Column 1</h6>
                <label class="form-control-label">
                    Project Title <span class="text-danger">*</span>
                </label>
                <textarea v-model="form.title" class="form-control" rows="3" required></textarea>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-md-6">
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

            <div class="col-md-6">
                <label class="form-control-label">
                    Sub-Category <span class="text-danger">*</span>
                </label>
                <select v-model="form.sub_category_id" class="form-control" required>
                    <option value="">-- Select Sub-Category --</option>
                    <option
                        v-for="subCategory in availableSubCategories"
                        :key="subCategory.id"
                        :value="subCategory.id"
                    >
                        {{ subCategory.name }}
                    </option>
                </select>
            </div>
        </div>

        <div class="row">
            <div class="col-md-3">
                <h6 class="mt-5">Column 3</h6>
                <label class="form-control-label">
                    Quantity and Size of the Project to be Procured
                    <span class="text-danger">*</span>
                </label>
                <textarea
                    v-model="form.quantity"
                    class="form-control"
                    rows="1"
                    style="resize: none"
                    required
                ></textarea>
            </div>

            <div class="col-md-3">
                <h6 class="mt-5">&nbsp;</h6>
                <label class="form-control-label">
                    Unit of Measurement <span class="text-danger">*</span>
                </label>
                <select v-model="form.quantity_type" class="form-control" required>
                    <option value="">Select Unit Type</option>
                    <option v-for="type in quantityTypes" :key="type.id" :value="type.id">
                        {{ type.name }}
                    </option>
                </select>
            </div>

            <div class="col-md-6">
                <h6 class="mt-5">Column 5</h6>
                <label class="form-control-label">
                    Pre-Procurement Conference <span class="text-danger">*</span>
                </label>
                <select v-model="form.pre_procurement_status" class="form-control" required>
                    <option value="">-- Select --</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <h6 class="mt-3">Column 2</h6>
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

            <div class="col-md-4">
                <h6 class="mt-3">Column 9</h6>
                <label class="form-control-label">
                    Estimated Authorized Budgetary Allocation (PhP)
                    <span class="text-danger">*</span>
                </label>
                <input v-model="form.amount" type="number" min="0" step="any" class="form-control" required />
            </div>

            <div class="col-md-4">
                <h6 class="mt-3">Column 4</h6>
                <label class="form-control-label">
                    Mode of Procurement <span class="text-danger">*</span>
                </label>
                <select v-model="form.mode_procurement_id" class="form-control mb-5" required>
                    <option value="">-- Select Mode --</option>
                    <option v-for="mode in ppmpModeProcurements" :key="mode.id" :value="mode.id">
                        {{ mode.name }}
                    </option>
                </select>
            </div>
        </div>

        <h3 class="mb-3">Projected Timeline (MM/YYYY)</h3>

        <div class="row">
            <div class="col-md-4">
                <h6 class="mt--1">Column 6</h6>
                <label class="form-control-label">
                    Start of Procurement Activity <span class="text-danger">*</span>
                </label>
                <input
                    v-model="form.start_date"
                    type="month"
                    class="form-control"
                    :min="monthMin"
                    :max="monthMax"
                    required
                />
            </div>

            <div class="col-md-4">
                <h6 class="mt--1">Column 7</h6>
                <label class="form-control-label">End of Procurement Activity</label>
                <input
                    v-model="form.end_date"
                    type="month"
                    class="form-control"
                    :min="monthMin"
                    :max="monthMax"
                />
            </div>

            <div class="col-md-4">
                <h6 class="mt--1">Column 8</h6>
                <label class="form-control-label">
                    Expected Delivery / Implementation Period
                </label>
                <input
                    v-model="form.expected_date"
                    type="month"
                    class="form-control"
                    :min="monthMin"
                    :max="monthMax"
                />
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <h6 class="mt-3">Column 10</h6>
                <label class="form-control-label">
                    Source of Funds <span class="text-danger">*</span>
                </label>

                <!-- Fixed by the plan, so the select only reports it. -->
                <select
                    class="form-control"
                    disabled
                    style="pointer-events: none; background-color: #e9ecef"
                >
                    <option v-for="fund in ppmpSourceFunds" :key="fund.id" :selected="fund.id === sourceFundId">
                        {{ fund.name }}
                    </option>
                </select>
            </div>
        </div>

        <h3 class="mt-5 mb-3">Additional Information</h3>

        <div class="row">
            <div class="col-md-6">
                <label class="form-control-label">Attached Supporting Documents</label>
                <textarea v-model="form.attached_documents" class="form-control" rows="2"></textarea>
                <h6 class="mt-1">Paste the Google Drive link to your attachments here.</h6>
            </div>

            <div class="col-md-6">
                <label class="form-control-label">Remarks</label>
                <textarea v-model="form.remarks" class="form-control" rows="2"></textarea>
            </div>
        </div>

        <div class="text-center card-footer bg-transparent mt-5">
            <NuxtLink :to="cancelTo" class="btn btn-secondary">Back</NuxtLink>

            <button type="submit" class="btn btn-primary" :disabled="!isComplete">
                {{ submitLabel }}
            </button>
        </div>
    </form>
</template>
