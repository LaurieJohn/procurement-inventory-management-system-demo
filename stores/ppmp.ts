import { defineStore } from 'pinia'
import {
    areaOffices,
    officeUnits,
    ppmpCategories,
    ppmpItemStatuses,
    ppmpModeProcurements,
    ppmpProjectTypes,
    ppmpSourceFunds,
    ppmpStatuses,
    ppmpSubCategories,
    ppmpTypes,
    quantityTypes,
    type PpmpSubCategory,
} from '~/data/reference'
import {
    ppmpFieldOffices as seedFieldOffices,
    ppmpItems as seedItems,
    ppmps as seedPpmps,
    users,
    type Ppmp,
    type PpmpFieldOffice,
    type PpmpItem,
} from '~/data/demo'

/**
 * PPMP statuses the plan itself moves through. The ids come from
 * pims_ppmp_statuses and the pages branch on them exactly as the Blade views
 * did.
 */
export const PPMP_STATUS = {
    created: 1,
    pendingFieldOffices: 2,
    closed: 3,
    forApproval: 4,
    approved: 5,
} as const

/**
 * Field-office statuses. A field office whose submission sits at one of
 * FIELD_OFFICE_LOCKED can no longer add, edit or delete its project items.
 */
export const FIELD_OFFICE_STATUS = {
    onGoing: 13,
    pendingResubmission: 14,
    approved: 15,
    closed: 16,
    reOpened: 17,
    completed: 18,
} as const

export const FIELD_OFFICE_LOCKED: number[] = [
    FIELD_OFFICE_STATUS.approved,
    FIELD_OFFICE_STATUS.closed,
    FIELD_OFFICE_STATUS.completed,
]

const clone = <T>(rows: T[]): T[] => rows.map((row) => ({ ...row }))

export const usePpmpStore = defineStore('ppmp', {
    state: () => ({
        ppmps: clone(seedPpmps),
        fieldOffices: clone(seedFieldOffices),
        items: clone(seedItems),
        subCategories: clone(ppmpSubCategories),
    }),

    getters: {
        /** Newest first, the order the listing used. */
        allPpmps: (state): Ppmp[] =>
            [...state.ppmps].sort((a, b) => b.created_at.localeCompare(a.created_at)),

        /** A PPMP is on-going while it is anywhere short of Consolidated. */
        hasOngoingPpmp: (state): boolean =>
            state.ppmps.some((ppmp) => [1, 3, 4, 5].includes(ppmp.status_id)),

        findPpmp: (state) => (id: number): Ppmp | undefined =>
            state.ppmps.find((ppmp) => ppmp.id === id),

        findItem: (state) => (id: number): PpmpItem | undefined =>
            state.items.find((item) => item.id === id),

        itemsFor: (state) => (ppmpId: number): PpmpItem[] =>
            state.items
                .filter((item) => item.ppmp_id === ppmpId)
                .sort((a, b) => b.created_at.localeCompare(a.created_at)),

        fieldOfficesFor: (state) => (ppmpId: number): PpmpFieldOffice[] =>
            state.fieldOffices.filter((office) => office.ppmp_id === ppmpId),

        /** area_offices.id values taking part in a PPMP. */
        fieldOfficeIdsFor: (state) => (ppmpId: number): number[] =>
            state.fieldOffices
                .filter((office) => office.ppmp_id === ppmpId)
                .map((office) => office.field_office),

        fieldOfficeStatus: (state) => (ppmpId: number, officeId: number): PpmpFieldOffice | null =>
            state.fieldOffices.find(
                (office) => office.ppmp_id === ppmpId && office.field_office === officeId,
            ) ?? null,

        subCategoriesFor: (state) => (categoryId: number | null): PpmpSubCategory[] =>
            categoryId === null
                ? state.subCategories
                : state.subCategories.filter((row) => row.category_id === categoryId),

        /* ----- Lookups, resolved by id ----- */

        typeName: () => (id: number | null): string =>
            ppmpTypes.find((row) => row.id === id)?.name ?? '-',

        statusName: () => (id: number | null): string =>
            ppmpStatuses.find((row) => row.id === id)?.name ?? '-',

        categoryName: () => (id: number | null): string =>
            ppmpCategories.find((row) => row.id === id)?.name ?? '-',

        subCategoryName: (state) => (id: number | null): string =>
            state.subCategories.find((row) => row.id === id)?.name ?? '-',

        projectTypeName: () => (id: number | null): string =>
            ppmpProjectTypes.find((row) => row.id === id)?.name ?? '-',

        modeProcurementName: () => (id: number | null): string =>
            ppmpModeProcurements.find((row) => row.id === id)?.name ?? '-',

        sourceFundName: () => (id: number | null): string =>
            ppmpSourceFunds.find((row) => row.id === id)?.name ?? '-',

        quantityTypeName: () => (id: number | null): string =>
            quantityTypes.find((row) => row.id === id)?.name ?? '',

        itemStatusName: () => (id: number | null): string =>
            ppmpItemStatuses.find((row) => row.id === id)?.name ?? '-',

        fieldOfficeName: () => (id: number | null): string =>
            areaOffices.find((row) => row.id === id)?.abbreviation ?? '-',

        unitName: () => (id: number | null): string =>
            officeUnits.find((row) => row.id === id)?.name ?? '',

        userName: () => (id: number | null): string =>
            users.find((row) => row.id === id)?.name ?? '-',

        /* ----- Totals ----- */

        itemCountFor(): (ppmpId: number) => number {
            return (ppmpId: number) => this.itemsFor(ppmpId).length
        },

        totalAmountFor(): (ppmpId: number) => number {
            return (ppmpId: number) =>
                this.itemsFor(ppmpId).reduce((total, item) => total + (item.amount ?? 0), 0)
        },

        /**
         * What a new plan for a fiscal year would be.
         *
         * The first plan of a year is Indicative, the second is the Final one,
         * and every plan after that is an Updated revision with the next version
         * number. The title follows from the type.
         */
        detectNextPlan(): (fiscalYear: number) => {
            fiscalYear: number
            typeId: number
            versionNo: string
            title: string
        } {
            return (fiscalYear: number) => {
                const existing = this.ppmps
                    .filter((ppmp) => ppmp.fiscal_year === fiscalYear)
                    .sort((a, b) => a.id - b.id)

                const latest = existing[existing.length - 1]

                if (!latest) {
                    return {
                        fiscalYear,
                        typeId: 1,
                        versionNo: '1.0',
                        title: `Indicative FY ${fiscalYear} Annual Procurement Plan Non-CSE (APP Non-CSE)`,
                    }
                }

                if (latest.type_id === 1) {
                    return {
                        fiscalYear,
                        typeId: 2,
                        versionNo: '2.0',
                        title: `FY ${fiscalYear} Annual Procurement Plan Non-CSE (APP Non-CSE)`,
                    }
                }

                const nextVersion = (Number.parseFloat(latest.version_no ?? '2.0') + 0.1).toFixed(1)

                return {
                    fiscalYear,
                    typeId: 3,
                    versionNo: nextVersion,
                    title: `Updated FY ${fiscalYear} Annual Procurement Plan Non-CSE (APP Non-CSE)`,
                }
            }
        },

        /** The headline figures the admin dashboard prints. */
        summary(): {
            total: number
            ongoing: number
            approved: number
            items: number
        } {
            return {
                total: this.ppmps.length,
                ongoing: this.ppmps.filter((ppmp) =>
                    [PPMP_STATUS.created, PPMP_STATUS.pendingFieldOffices, PPMP_STATUS.closed, PPMP_STATUS.forApproval].includes(
                        ppmp.status_id as 1 | 2 | 3 | 4,
                    ),
                ).length,
                approved: this.ppmps.filter((ppmp) => ppmp.status_id >= PPMP_STATUS.approved).length,
                items: this.items.length,
            }
        },
    },

    actions: {
        /* ----- The plan ----- */

        createPpmp(
            attributes: Partial<Ppmp> & {
                name: string
                fiscal_year: number
                fieldOfficeIds?: number[]
            },
        ): Ppmp {
            const now = timestamp()

            const ppmp: Ppmp = {
                id: nextId(this.ppmps),
                user_id: attributes.user_id ?? 1,
                name: attributes.name,
                type_id: attributes.type_id ?? 1,
                version_no: attributes.version_no ?? '1.0',
                fiscal_year: attributes.fiscal_year,
                year_status: attributes.year_status ?? 'Current',
                status_id: PPMP_STATUS.created,
                ppmp_deadline_at: attributes.ppmp_deadline_at ?? null,
                unit_deadline_at: attributes.unit_deadline_at ?? null,
                designate_deadline_at: attributes.designate_deadline_at ?? null,
                supply_deadline_at: attributes.supply_deadline_at ?? null,
                budget_deadline_at: attributes.budget_deadline_at ?? null,
                upload_deadline_at: attributes.upload_deadline_at ?? null,
                created_at: now,
                updated_at: now,
            }

            this.ppmps.push(ppmp)

            for (const officeId of attributes.fieldOfficeIds ?? []) {
                this.fieldOffices.push({
                    id: nextId(this.fieldOffices),
                    ppmp_id: ppmp.id,
                    field_office: officeId,
                    status_id: FIELD_OFFICE_STATUS.onGoing,
                    uploaded_ppmp_form: null,
                    supply_officer_remarks: null,
                    ppmp_uploaded_at: null,
                })
            }

            return ppmp
        },

        updatePpmp(id: number, attributes: Partial<Ppmp> & { fieldOfficeIds?: number[] }): void {
            const ppmp = this.findPpmp(id)

            if (!ppmp) {
                return
            }

            const { fieldOfficeIds, ...changes } = attributes

            Object.assign(ppmp, changes, { updated_at: timestamp() })

            if (fieldOfficeIds) {
                this.syncFieldOffices(id, fieldOfficeIds)
            }
        },

        syncFieldOffices(ppmpId: number, officeIds: number[]): void {
            // Drop the offices that were unticked, but only when they hold no
            // items — the same guard the controller applied.
            this.fieldOffices = this.fieldOffices.filter((office) => {
                if (office.ppmp_id !== ppmpId) {
                    return true
                }

                if (officeIds.includes(office.field_office)) {
                    return true
                }

                return this.items.some(
                    (item) => item.ppmp_id === ppmpId && item.fieldoffice_id === office.field_office,
                )
            })

            for (const officeId of officeIds) {
                if (this.fieldOfficeStatus(ppmpId, officeId)) {
                    continue
                }

                this.fieldOffices.push({
                    id: nextId(this.fieldOffices),
                    ppmp_id: ppmpId,
                    field_office: officeId,
                    status_id: FIELD_OFFICE_STATUS.onGoing,
                    uploaded_ppmp_form: null,
                    supply_officer_remarks: null,
                    ppmp_uploaded_at: null,
                })
            }
        },

        deletePpmp(id: number): void {
            this.ppmps = this.ppmps.filter((ppmp) => ppmp.id !== id)
            this.fieldOffices = this.fieldOffices.filter((office) => office.ppmp_id !== id)
            this.items = this.items.filter((item) => item.ppmp_id !== id)
        },

        /**
         * The plan's own status transitions, driven from the actions dropdown on
         * the show page: close it for review, submit it for approval, approve it,
         * or reopen it.
         */
        togglePpmpStatus(id: number, action: 'submit' | 'forapprove' | 'approve' | 'reopen'): void {
            const ppmp = this.findPpmp(id)

            if (!ppmp) {
                return
            }

            const target = {
                submit: PPMP_STATUS.closed,
                forapprove: PPMP_STATUS.forApproval,
                approve: PPMP_STATUS.approved,
                reopen: PPMP_STATUS.created,
            }[action]

            ppmp.status_id = target
            ppmp.updated_at = timestamp()

            // Closing the plan closes every participating office with it, and
            // reopening puts them back on-going.
            for (const office of this.fieldOfficesFor(id)) {
                if (action === 'submit') {
                    office.status_id = FIELD_OFFICE_STATUS.closed
                } else if (action === 'reopen') {
                    office.status_id = FIELD_OFFICE_STATUS.onGoing
                }
            }
        },

        /* ----- Field offices ----- */

        toggleFieldOfficeStatus(
            ppmpId: number,
            officeId: number,
            action: 'reopen' | 'complete' | 'approve' | 'resubmit',
            remarks: string | null = null,
        ): void {
            const office = this.fieldOfficeStatus(ppmpId, officeId)

            if (!office) {
                return
            }

            office.status_id = {
                reopen: FIELD_OFFICE_STATUS.reOpened,
                complete: FIELD_OFFICE_STATUS.completed,
                approve: FIELD_OFFICE_STATUS.approved,
                resubmit: FIELD_OFFICE_STATUS.pendingResubmission,
            }[action]

            if (action === 'resubmit') {
                office.supply_officer_remarks = remarks
            }
        },

        uploadFieldOfficeForm(ppmpId: number, officeId: number, fileName: string): void {
            const office = this.fieldOfficeStatus(ppmpId, officeId)

            if (!office) {
                return
            }

            office.uploaded_ppmp_form = fileName
            office.ppmp_uploaded_at = timestamp()
        },

        /* ----- Project items ----- */

        /**
         * Whether the signed-in user may add a project item to this plan: their
         * office has to be part of it, and that office's submission must still be
         * open.
         */
        canAddItem(ppmpId: number, areaOfficeId: number | null): boolean {
            if (areaOfficeId === null) {
                return false
            }

            const office = this.fieldOfficeStatus(ppmpId, areaOfficeId)

            if (!office) {
                return false
            }

            return !FIELD_OFFICE_LOCKED.includes(office.status_id)
        },

        createItem(attributes: Partial<PpmpItem> & { ppmp_id: number; title: string }): PpmpItem {
            const now = timestamp()

            const item: PpmpItem = {
                id: nextId(this.items),
                ppmp_id: attributes.ppmp_id,
                user_id: attributes.user_id ?? 1,
                fieldoffice_id: attributes.fieldoffice_id ?? 1,
                unit_id: attributes.unit_id ?? null,
                status: 1,
                title: attributes.title,
                category_id: attributes.category_id ?? 1,
                sub_category_id: attributes.sub_category_id ?? 1,
                project_type_id: attributes.project_type_id ?? 1,
                quantity: attributes.quantity ?? '',
                quantity_type: attributes.quantity_type ?? null,
                amount: attributes.amount ?? 0,
                mode_procurement_id: attributes.mode_procurement_id ?? 2,
                pre_procurement_status: attributes.pre_procurement_status ?? false,
                start_date: attributes.start_date ?? null,
                end_date: attributes.end_date ?? null,
                expected_date: attributes.expected_date ?? null,
                source_fund_id: attributes.source_fund_id ?? 1,
                attached_documents: attributes.attached_documents ?? null,
                remarks: attributes.remarks ?? null,
                supply_remarks: null,
                budget_remarks: null,
                supply_modified: null,
                budget_modified: null,
                created_at: now,
                updated_at: now,
            }

            this.items.push(item)

            return item
        },

        updateItem(id: number, attributes: Partial<PpmpItem>): void {
            const item = this.findItem(id)

            if (!item) {
                return
            }

            Object.assign(item, attributes, { updated_at: timestamp() })
        },

        deleteItem(id: number): void {
            this.items = this.items.filter((item) => item.id !== id)
        },

        /**
         * Supply's review pass: it may change the item's details and its note,
         * and the row is tagged so the change is visible on the listing.
         */
        applySupplyReview(id: number, attributes: Partial<PpmpItem>): void {
            const item = this.findItem(id)

            if (!item) {
                return
            }

            Object.assign(item, attributes, {
                supply_modified: 1,
                status: 4,
                updated_at: timestamp(),
            })
        },

        /** Budget's review pass, which only touches the allocation and its note. */
        applyBudgetReview(id: number, amount: number, remarks: string | null): void {
            const item = this.findItem(id)

            if (!item) {
                return
            }

            item.amount = amount
            item.budget_remarks = remarks
            item.budget_modified = 1
            item.status = 5
            item.updated_at = timestamp()
        },

        /** Move an item to another Division/Field Office and Unit. */
        transferItem(id: number, fieldOfficeId: number, unitId: number | null): void {
            const item = this.findItem(id)

            if (!item) {
                return
            }

            item.fieldoffice_id = fieldOfficeId
            item.unit_id = unitId
            item.updated_at = timestamp()
        },

        /* ----- Sub-categories ----- */

        createSubCategory(attributes: Omit<PpmpSubCategory, 'id'>): PpmpSubCategory {
            const subCategory: PpmpSubCategory = { id: nextId(this.subCategories), ...attributes }

            this.subCategories.push(subCategory)

            return subCategory
        },

        updateSubCategory(id: number, attributes: Partial<PpmpSubCategory>): void {
            const subCategory = this.subCategories.find((row) => row.id === id)

            if (subCategory) {
                Object.assign(subCategory, attributes)
            }
        },

        deleteSubCategory(id: number): void {
            this.subCategories = this.subCategories.filter((row) => row.id !== id)
        },
    },
})

function nextId(rows: { id: number }[]): number {
    return rows.reduce((highest, row) => Math.max(highest, row.id), 0) + 1
}

function timestamp(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
