<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { quantityTypes } from '~/data/reference'
import type { PrItem } from '~/data/demo'

/**
 * The Purchase Request item form, shared by the add and edit pages.
 *
 * Every item is tied to the PPMP Project Item it is drawn from — that link is
 * what lets Supply check a request against the approved plan.
 */
const props = defineProps<{
    item?: PrItem | null
    /** The PPMP Project Items this office may draw from. */
    projectItems: { id: number; title: string }[]
    submitLabel: string
    cancelTo: string
}>()

const emit = defineEmits<{ submit: [values: Record<string, unknown>] }>()

const modal = usePimsModal()

const form = reactive({
    item_name: props.item?.item_name ?? '',
    ppmp_project_item_id: props.item?.ppmp_project_item_id ?? ('' as number | ''),
    item_description: props.item?.item_description ?? '',
    unit_id: props.item?.unit_id ?? ('' as number | ''),
    quantity: props.item?.quantity ?? ('' as number | ''),
    unit_cost: props.item?.unit_cost ?? ('' as number | ''),
})

/** Total Unit Cost is derived, never typed. */
const totalUnitCost = computed(() => Number(form.quantity || 0) * Number(form.unit_cost || 0))

watch(
    () => form.quantity,
    (value) => {
        if (Number(value) < 0) {
            form.quantity = 0
        }
    },
)

const isComplete = computed(() =>
    [
        form.item_name.trim(),
        form.ppmp_project_item_id,
        form.item_description.trim(),
        form.unit_id,
        form.quantity,
        form.unit_cost,
    ].every((value) => value !== '' && value !== null),
)

async function submit(): Promise<void> {
    if (!isComplete.value) {
        await modal.notice({
            title: 'Validation Error',
            text: 'Please fill in all required fields.',
        })

        return
    }

    emit('submit', {
        item_name: form.item_name,
        ppmp_project_item_id: Number(form.ppmp_project_item_id),
        item_description: form.item_description,
        unit_id: Number(form.unit_id),
        quantity: Number(form.quantity),
        unit_cost: Number(form.unit_cost),
        total_unit_cost: totalUnitCost.value,
    })
}
</script>

<template>
    <form @submit.prevent="submit">
        <div class="row">
            <div class="col-md-12">
                <div class="form-group">
                    <label class="form-control-label" for="item-name">Item Name:</label>

                    <input
                        id="item-name"
                        v-model="form.item_name"
                        type="text"
                        class="form-control"
                        placeholder="Ex. Laptop"
                        required
                    />
                </div>
            </div>

            <div class="col-md-12">
                <div class="form-group">
                    <label class="form-control-label" for="ppmp-project-item-id">
                        Select the corresponding PPMP:
                    </label>

                    <select
                        id="ppmp-project-item-id"
                        v-model="form.ppmp_project_item_id"
                        class="form-control"
                        required
                    >
                        <option value="" disabled>Select PPMP</option>
                        <option
                            v-for="projectItem in projectItems"
                            :key="projectItem.id"
                            :value="projectItem.id"
                        >
                            {{ projectItem.title }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="col-md-12">
                <div class="form-group">
                    <label class="form-control-label" for="item-description">
                        Item Description
                        <em>(Note: Use an asterisk (*) before each additional item description.)</em>
                    </label>

                    <textarea
                        id="item-description"
                        v-model="form.item_description"
                        class="form-control"
                        rows="5"
                        placeholder="Ex. * Item Description Format"
                        required
                    ></textarea>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-2">
                <div class="form-group">
                    <label class="form-control-label" for="unit_id">Unit:</label>

                    <select id="unit_id" v-model="form.unit_id" class="form-control" required>
                        <option value="" disabled>Select Unit</option>
                        <option v-for="type in quantityTypes" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="col-md-2">
                <div class="form-group">
                    <label class="form-control-label" for="quantity">Quantity:</label>

                    <input
                        id="quantity"
                        v-model.number="form.quantity"
                        type="number"
                        min="0"
                        class="form-control"
                        placeholder="Ex. 10"
                        required
                    />
                </div>
            </div>

            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label" for="unit-cost">Unit Cost:</label>

                    <input
                        id="unit-cost"
                        v-model.number="form.unit_cost"
                        type="number"
                        min="0"
                        step="any"
                        class="form-control"
                        placeholder="Ex. 1000"
                        required
                    />
                </div>
            </div>

            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label" for="total-unit-cost">Total Unit Cost:</label>

                    <input
                        id="total-unit-cost"
                        type="text"
                        class="form-control"
                        :value="amount(totalUnitCost)"
                        readonly
                    />
                </div>
            </div>
        </div>

        <div class="text-center card-footer bg-transparent mt-3">
            <NuxtLink :to="cancelTo" class="btn btn-secondary">Cancel</NuxtLink>

            <button type="submit" class="btn btn-primary">{{ submitLabel }}</button>
        </div>
    </form>
</template>
