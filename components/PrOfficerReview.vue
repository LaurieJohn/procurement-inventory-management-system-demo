<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { quantityTypes } from '~/data/reference'
import type { Procurement } from '~/data/demo'

/**
 * The officer review of a Purchase Request's items.
 *
 * Supply specifies what is bought — unit and quantity — and Budget prices it.
 * Each office edits only its own columns, so the same table serves both with
 * the other side's columns shown read-only.
 */
const props = defineProps<{ procurement: Procurement; office: 'supply' | 'budget' }>()

const store = usePurchaseRequestStore()
const ppmp = usePpmpStore()
const modal = usePimsModal()

const rows = computed(() =>
    store.lotsFor(props.procurement.id).flatMap((lot) =>
        store.itemsForLot(lot.id).map((item) => ({ lot, item })),
    ),
)

type Draft = {
    unit_id: number
    quantity: number
    unit_cost: number
    supply_officer_remarks: string
    budget_officer_remarks: string
}

const drafts = reactive<Record<number, Draft>>({})

function draftFor(itemId: number): Draft {
    if (!drafts[itemId]) {
        const item = store.findItem(itemId)!

        drafts[itemId] = {
            unit_id: item.unit_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            supply_officer_remarks: item.supply_officer_remarks ?? '',
            budget_officer_remarks: item.budget_officer_remarks ?? '',
        }
    }

    return drafts[itemId]
}

function draftTotalFor(itemId: number): number {
    const draft = draftFor(itemId)

    return Number(draft.quantity || 0) * Number(draft.unit_cost || 0)
}

const draftTotal = computed(() =>
    rows.value.reduce((total, row) => total + draftTotalFor(row.item.id), 0),
)

const saving = ref(false)

async function save(): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Save the reviewed items?',
        text:
            props.office === 'supply'
                ? 'The reviewed units and quantities will replace what the requesting office submitted.'
                : 'The reviewed unit costs will replace the amounts on this Purchase Request.',
        confirmText: 'Save Review',
        variant: 'primary',
    })

    if (!confirmed) {
        return
    }

    saving.value = true

    for (const { item } of rows.value) {
        const draft = drafts[item.id]

        if (!draft) {
            continue
        }

        if (props.office === 'supply') {
            store.applyOfficerReview(
                item.id,
                {
                    unit_id: Number(draft.unit_id),
                    quantity: Number(draft.quantity),
                    supply_officer_remarks: draft.supply_officer_remarks || null,
                },
                'supply',
            )
        } else {
            store.applyOfficerReview(
                item.id,
                {
                    unit_cost: Number(draft.unit_cost),
                    budget_officer_remarks: draft.budget_officer_remarks || null,
                },
                'budget',
            )
        }
    }

    saving.value = false
    modal.success('Purchase Request items updated successfully')

    await navigateTo(`/PIMS/admin/purchase-request/${props.procurement.id}`)
}

function ppmpItemTitle(id: number | null): string {
    if (id === null) {
        return 'Not linked'
    }

    return ppmp.findItem(id)?.title ?? 'Not found'
}
</script>

<template>
    <div class="card shadow-sm">
        <div class="card-header pb-3 d-flex align-items-center justify-content-between">
            <p class="mb-0">
                {{
                    office === 'supply'
                        ? 'Review the item details on this Purchase Request'
                        : 'Review the unit costs on this Purchase Request'
                }}
            </p>

            <span class="badge badge-lg badge-primary">Total: {{ peso(draftTotal) }}</span>
        </div>

        <form @submit.prevent="save">
            <div class="table-responsive">
                <table class="table table-bordered table-sm align-items-center mb-0">
                    <thead class="thead-light text-center">
                        <tr>
                            <th>#</th>
                            <th>Lot</th>
                            <th style="min-width: 200px">Item Name</th>
                            <th style="min-width: 300px">Item Description</th>
                            <th style="min-width: 200px">PPMP Project Item</th>
                            <th style="min-width: 160px">
                                Unit
                                <span v-if="office === 'supply'" class="text-danger">*</span>
                            </th>
                            <th style="min-width: 110px">
                                Quantity
                                <span v-if="office === 'supply'" class="text-danger">*</span>
                            </th>
                            <th style="min-width: 140px" class="text-right">
                                Unit Cost (PhP)
                                <span v-if="office === 'budget'" class="text-danger">*</span>
                            </th>
                            <th class="text-right">Total Unit Cost</th>
                            <th style="width: 300px">
                                {{ office === 'supply' ? 'Supply Officer Notes' : 'Budget Officer Notes' }}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(row, index) in rows" :key="row.item.id">
                            <td class="text-center">{{ index + 1 }}</td>
                            <td class="text-center">{{ row.lot.lot_no }}</td>
                            <td class="text-wrap">{{ row.item.item_name }}</td>
                            <td class="text-wrap" style="white-space: pre-line">
                                {{ row.item.item_description }}
                            </td>
                            <td class="text-wrap">{{ ppmpItemTitle(row.item.ppmp_project_item_id) }}</td>

                            <td>
                                <select
                                    v-if="office === 'supply'"
                                    v-model.number="draftFor(row.item.id).unit_id"
                                    class="form-control form-control-sm"
                                    required
                                >
                                    <option v-for="type in quantityTypes" :key="type.id" :value="type.id">
                                        {{ type.name }}
                                    </option>
                                </select>

                                <span v-else class="text-muted">{{ store.unitName(row.item.unit_id) }}</span>
                            </td>

                            <td class="text-right">
                                <input
                                    v-if="office === 'supply'"
                                    v-model.number="draftFor(row.item.id).quantity"
                                    type="number"
                                    min="0"
                                    class="form-control form-control-sm text-right"
                                    required
                                />

                                <span v-else class="text-muted">{{ count(row.item.quantity) }}</span>
                            </td>

                            <td class="text-right">
                                <input
                                    v-if="office === 'budget'"
                                    v-model.number="draftFor(row.item.id).unit_cost"
                                    type="number"
                                    min="0"
                                    step="any"
                                    class="form-control form-control-sm text-right"
                                    required
                                />

                                <span v-else class="text-muted">{{ peso(row.item.unit_cost) }}</span>
                            </td>

                            <td class="text-right">{{ peso(draftTotalFor(row.item.id)) }}</td>

                            <td>
                                <textarea
                                    v-if="office === 'supply'"
                                    v-model="draftFor(row.item.id).supply_officer_remarks"
                                    class="form-control form-control-sm"
                                    rows="2"
                                    placeholder="Note what was changed and why"
                                ></textarea>

                                <textarea
                                    v-else
                                    v-model="draftFor(row.item.id).budget_officer_remarks"
                                    class="form-control form-control-sm"
                                    rows="2"
                                    placeholder="Note the reason for the revision"
                                ></textarea>
                            </td>
                        </tr>

                        <tr v-if="rows.length === 0">
                            <td colspan="10" class="text-center bg-light py-4">
                                <small class="text-muted text-uppercase">
                                    This Purchase Request has no items yet.
                                </small>
                            </td>
                        </tr>
                    </tbody>

                    <tfoot v-if="rows.length" class="thead-light">
                        <tr>
                            <th colspan="8" class="text-right">Overall Total</th>
                            <th class="text-right">{{ peso(draftTotal) }}</th>
                            <th></th>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="text-center card-footer bg-transparent">
                <NuxtLink
                    :to="`/PIMS/admin/purchase-request/${procurement.id}`"
                    class="btn btn-secondary"
                >
                    Back
                </NuxtLink>

                <button type="submit" class="btn btn-primary" :disabled="saving || rows.length === 0">
                    Save Review
                </button>
            </div>
        </form>
    </div>
</template>
