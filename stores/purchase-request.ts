import { defineStore } from 'pinia'
import {
    disbursementTypes,
    ppmpModeProcurements,
    prTypes,
    procurementStatuses,
    quantityTypes,
} from '~/data/reference'
import {
    lots as seedLots,
    prAttachments as seedAttachments,
    prItems as seedItems,
    procurements as seedProcurements,
    users,
    type Lot,
    type PrAttachment,
    type PrItem,
    type Procurement,
} from '~/data/demo'
import {
    DOCUMENTS,
    DOCUMENT_REQUIREMENTS,
    LATE_JUSTIFICATION_DOCUMENT,
    UNIVERSAL_DOCUMENTS,
    type DocumentView,
} from '~/data/documents'

/** supply_procurement_statuses.id values the workflow branches on. */
export const PR_STATUS = {
    created: 1,
    forResubmission: 2,
    denied: 3,
    closed: 4,
    submitted: 5,
    unitHead: 6,
    divisionFoHead: 7,
    supplyOfficer: 8,
    budgetOfficer: 9,
    ord: 10,
    approved: 11,
} as const

/**
 * The approval route most PR types follow: the request is cleared by the
 * Division/Field Office Head and the Supply Officer before it reaches Budget
 * and the ORD.
 */
export const APPROVAL_ROUTE_FULL: number[] = [
    PR_STATUS.submitted,
    PR_STATUS.divisionFoHead,
    PR_STATUS.supplyOfficer,
    PR_STATUS.budgetOfficer,
    PR_STATUS.ord,
    PR_STATUS.approved,
]

/**
 * The shortened route: these PR types skip the Division/FO Head and Supply
 * Officer stages and go straight to Budget.
 */
export const APPROVAL_ROUTE_SHORT: number[] = [
    PR_STATUS.submitted,
    PR_STATUS.budgetOfficer,
    PR_STATUS.ord,
    PR_STATUS.approved,
]

/** supply_pr_types.id values that take the shortened route. */
export const SHORT_ROUTE_PR_TYPES = [3, 7, 8, 9, 10]

/**
 * PR types whose lead time is fixed by an event date, so Date Required/Needed
 * stops being optional for them.
 */
export const DATE_REQUIRED_PR_TYPES = [8, 9, 10]

/**
 * Lead time, in days, a date-driven Purchase Request is expected to allow.
 * Filing with less leaves the requester owing a Late Justification Letter.
 */
export const LATE_JUSTIFICATION_THRESHOLD_DAYS = 30

/**
 * Statuses in which the Purchase Request belongs to its requester: a draft they
 * have not sent yet, and one an approver has handed back for correction.
 */
export const EDITABLE_STATUSES: number[] = [PR_STATUS.created, PR_STATUS.forResubmission]

/** Each For Approval status mapped to the column its office records remarks in. */
export const STAGE_REMARKS_COLUMNS: Record<number, string> = {
    [PR_STATUS.unitHead]: 'remarks_unit_head',
    [PR_STATUS.divisionFoHead]: 'remarks_division_fo_head',
    [PR_STATUS.supplyOfficer]: 'remarks_supply_officer',
    [PR_STATUS.budgetOfficer]: 'remarks_budget_officer',
    [PR_STATUS.ord]: 'remarks_ord',
}

/** Every remarks column in route order, mapped to the office that owns it. */
export const REMARKS_COLUMNS: Record<string, string> = {
    remarks_unit_head: 'Unit Head',
    remarks_division_fo_head: 'Division/FO Head',
    remarks_supply_officer: 'Supply Officer',
    remarks_budget_officer: 'Budget Officer',
    remarks_ord: 'ORD',
}

const clone = <T>(rows: T[]): T[] => rows.map((row) => ({ ...row }))

export const usePurchaseRequestStore = defineStore('purchase-request', {
    state: () => ({
        procurements: clone(seedProcurements),
        lots: clone(seedLots),
        items: clone(seedItems),
        attachments: clone(seedAttachments) as PrAttachment[],
    }),

    getters: {
        /** Newest first, the order the listing used. */
        allProcurements: (state): Procurement[] =>
            [...state.procurements].sort((a, b) => b.created_at.localeCompare(a.created_at)),

        find: (state) => (id: number): Procurement | undefined =>
            state.procurements.find((row) => row.id === id),

        findLot: (state) => (id: number): Lot | undefined =>
            state.lots.find((row) => row.id === id),

        findItem: (state) => (id: number): PrItem | undefined =>
            state.items.find((row) => row.id === id),

        lotsFor: (state) => (procurementId: number): Lot[] =>
            state.lots
                .filter((lot) => lot.procurement_id === procurementId)
                .sort((a, b) => a.lot_no - b.lot_no),

        itemsForLot: (state) => (lotId: number): PrItem[] =>
            state.items.filter((item) => item.lot_id === lotId),

        itemsFor(): (procurementId: number) => PrItem[] {
            return (procurementId: number) =>
                this.lotsFor(procurementId).flatMap((lot) => this.itemsForLot(lot.id))
        },

        itemCountFor(): (procurementId: number) => number {
            return (procurementId: number) => this.itemsFor(procurementId).length
        },

        totalFor(): (procurementId: number) => number {
            return (procurementId: number) =>
                this.itemsFor(procurementId).reduce((sum, item) => sum + item.total_unit_cost, 0)
        },

        attachmentFor: (state) => (procurementId: number): PrAttachment | undefined =>
            state.attachments.find((row) => row.pr_id === procurementId),

        /* ----- Lookups ----- */

        statusLabel: () => (id: number | null): string =>
            procurementStatuses.find((row) => row.id === id)?.type ?? 'No status',

        prTypeName: () => (id: number | null): string | null =>
            prTypes.find((row) => row.id === id)?.name ?? null,

        modeProcurementName: () => (id: number | null): string | null =>
            ppmpModeProcurements.find((row) => row.id === id)?.name ?? null,

        disbursementTypeName: () => (id: number | null): string | null =>
            disbursementTypes.find((row) => row.id === id)?.type ?? null,

        unitName: () => (id: number | null): string =>
            quantityTypes.find((row) => row.id === id)?.name ?? '',

        userName: () => (id: number | null): string =>
            users.find((row) => row.id === id)?.name ?? '-',

        /* ----- Workflow ----- */

        /** The ordered approval route a request follows, chosen by its PR type. */
        approvalRoute: () => (procurement: Procurement): number[] =>
            SHORT_ROUTE_PR_TYPES.includes(Number(procurement.pr_type_id))
                ? APPROVAL_ROUTE_SHORT
                : APPROVAL_ROUTE_FULL,

        /**
         * The status a request moves to when the current stage approves it, or
         * null when it is off the route or already Approved.
         */
        nextApprovalStatusId(): (procurement: Procurement) => number | null {
            return (procurement: Procurement) => {
                const route = this.approvalRoute(procurement)
                const index = route.indexOf(Number(procurement.procurement_status_id))

                if (index === -1 || route[index + 1] === undefined) {
                    return null
                }

                return route[index + 1]
            }
        },

        isAwaitingApproval(): (procurement: Procurement) => boolean {
            return (procurement: Procurement) => this.nextApprovalStatusId(procurement) !== null
        },

        /**
         * A Purchase Request — along with its lots, items and documents — may only
         * be changed while it sits in Created or For Resubmission.
         */
        isLocked: () => (procurement: Procurement): boolean =>
            !EDITABLE_STATUSES.includes(Number(procurement.procurement_status_id)),

        isSubmitted: () => (procurement: Procurement): boolean =>
            Number(procurement.procurement_status_id) === PR_STATUS.submitted,

        isForResubmission: () => (procurement: Procurement): boolean =>
            Number(procurement.procurement_status_id) === PR_STATUS.forResubmission,

        /**
         * The PR Type decides which documents are required and which route the
         * request takes, so it can only be chosen while the request is still an
         * untouched draft.
         */
        canChangePrType(): (procurement: Procurement) => boolean {
            return (procurement: Procurement) =>
                !this.isLocked(procurement) && !this.isForResubmission(procurement)
        },

        /**
         * Display only: the office a Purchase Request is waiting on while it sits
         * at Submitted for Approval. Every later stage names its own office.
         */
        pendingWith(): (procurement: Procurement) => string | null {
            return (procurement: Procurement) => {
                if (!this.isSubmitted(procurement)) {
                    return null
                }

                return SHORT_ROUTE_PR_TYPES.includes(Number(procurement.pr_type_id))
                    ? 'Supply Officer'
                    : 'Unit Head'
            }
        },

        /** The remarks column the stage this request sits at writes to. */
        remarksColumnForCurrentStage(): (procurement: Procurement) => string | null {
            return (procurement: Procurement) => {
                if (this.isSubmitted(procurement)) {
                    return SHORT_ROUTE_PR_TYPES.includes(Number(procurement.pr_type_id))
                        ? 'remarks_supply_officer'
                        : 'remarks_unit_head'
                }

                return STAGE_REMARKS_COLUMNS[Number(procurement.procurement_status_id)] ?? null
            }
        },

        /** Remarks left along the way, in route order, skipping empty stages. */
        stageRemarks: () => (procurement: Procurement): { office: string; remark: string }[] =>
            Object.entries(REMARKS_COLUMNS)
                .filter(([column]) => {
                    const value = (procurement as unknown as Record<string, string | null>)[column]

                    return typeof value === 'string' && value.trim() !== ''
                })
                .map(([column, office]) => ({
                    office,
                    remark: (procurement as unknown as Record<string, string>)[column],
                })),

        /** Whether Date Required/Needed is mandatory for the given PR type. */
        requiresDateNeeded: () => (prTypeId: number | null): boolean =>
            DATE_REQUIRED_PR_TYPES.includes(Number(prTypeId)),

        /** Whole days from today until Date Required/Needed. */
        daysUntilDateRequired: () => (procurement: Procurement): number | null => {
            if (!procurement.date_required) {
                return null
            }

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const required = new Date(`${procurement.date_required}T00:00:00`)

            return Math.round((required.getTime() - today.getTime()) / 86_400_000)
        },

        /**
         * A Late Justification Letter is owed when a date-driven PR type is filed
         * with less than the expected lead time.
         */
        requiresLateJustification(): (procurement: Procurement) => boolean {
            return (procurement: Procurement) => {
                if (!this.requiresDateNeeded(procurement.pr_type_id)) {
                    return false
                }

                const remaining = this.daysUntilDateRequired(procurement)

                return remaining !== null && remaining < LATE_JUSTIFICATION_THRESHOLD_DAYS
            }
        },

        /* ----- Supporting documents ----- */

        /**
         * The documents this Purchase Request calls for, mapped to whether each is
         * mandatory. The universal documents always come first.
         */
        applicableDocuments(): (procurement: Procurement) => Record<string, boolean> {
            return (procurement: Procurement) => {
                const documents: Record<string, boolean> = {}

                for (const field of UNIVERSAL_DOCUMENTS) {
                    documents[field] = false
                }

                if (this.requiresLateJustification(procurement)) {
                    documents[LATE_JUSTIFICATION_DOCUMENT] = true
                }

                const required = DOCUMENT_REQUIREMENTS[Number(procurement.pr_type_id)] ?? {}

                for (const [field, mandatory] of Object.entries(required)) {
                    documents[field] = mandatory
                }

                return documents
            }
        },

        /**
         * The per-document view model that backs the upload cards. A document
         * holding a file but falling outside the current PR type is still listed,
         * so it stays visible and removable instead of orphaned.
         */
        documentList(): (procurement: Procurement) => DocumentView[] {
            return (procurement: Procurement) => {
                const attachment = this.attachmentFor(procurement.id)
                const applicable = this.applicableDocuments(procurement)
                const describe = (field: string, required: boolean, isApplicable: boolean): DocumentView => {
                    const name = (attachment?.[field] as string | null | undefined) ?? null

                    return {
                        field,
                        label: DOCUMENTS[field],
                        name,
                        stored: Boolean(name),
                        required,
                        applicable: isApplicable,
                    }
                }

                const documents = Object.entries(applicable).map(([field, required]) =>
                    describe(field, required, true),
                )

                for (const field of Object.keys(DOCUMENTS)) {
                    if (field in applicable) {
                        continue
                    }

                    if (!attachment?.[field]) {
                        continue
                    }

                    documents.push(describe(field, false, false))
                }

                return documents
            }
        },

        /**
         * Labels of the documents this Purchase Request must upload before it can
         * be submitted for approval.
         */
        missingRequiredDocuments(): (procurement: Procurement) => string[] {
            return (procurement: Procurement) => {
                const attachment = this.attachmentFor(procurement.id)

                return Object.entries(this.applicableDocuments(procurement))
                    .filter(([field, required]) => required && !attachment?.[field])
                    .map(([field]) => DOCUMENTS[field])
            }
        },

        /** A request can be submitted once it has a PR Type and every required document. */
        canSubmit(): (procurement: Procurement) => boolean {
            return (procurement: Procurement) =>
                procurement.pr_type_id !== null &&
                this.missingRequiredDocuments(procurement).length === 0
        },

        /* ----- Dashboard figures ----- */

        summary(): {
            total: number
            drafts: number
            awaitingDecision: number
            inProgress: number
            approved: number
            returned: number
            denied: number
            value: number
        } {
            const rows = this.procurements

            return {
                total: rows.length,
                drafts: rows.filter((row) => row.procurement_status_id === PR_STATUS.created).length,
                awaitingDecision: rows.filter(
                    (row) => row.procurement_status_id === PR_STATUS.submitted,
                ).length,
                inProgress: rows.filter((row) =>
                    [
                        PR_STATUS.unitHead,
                        PR_STATUS.divisionFoHead,
                        PR_STATUS.supplyOfficer,
                        PR_STATUS.budgetOfficer,
                        PR_STATUS.ord,
                    ].includes(row.procurement_status_id as 6 | 7 | 8 | 9 | 10),
                ).length,
                approved: rows.filter((row) => row.procurement_status_id === PR_STATUS.approved).length,
                returned: rows.filter(
                    (row) => row.procurement_status_id === PR_STATUS.forResubmission,
                ).length,
                denied: rows.filter((row) => row.procurement_status_id === PR_STATUS.denied).length,
                value: rows.reduce((sum, row) => sum + this.totalFor(row.id), 0),
            }
        },
    },

    actions: {
        /* ----- The request ----- */

        /**
         * Creating a Purchase Request also opens its first lot, which is where the
         * requester is taken next.
         */
        create(attributes: Partial<Procurement> & { title: string }): { procurement: Procurement; lot: Lot } {
            const now = timestamp()

            const procurement: Procurement = {
                id: nextId(this.procurements),
                user_id: attributes.user_id ?? 1,
                disbursement_id: attributes.disbursement_id ?? 4,
                request_by: attributes.request_by ?? '',
                approved_by: attributes.approved_by ?? '',
                title: attributes.title,
                description: attributes.description ?? '',
                procurement_status_id: PR_STATUS.created,
                pr_type_id: attributes.pr_type_id ?? null,
                mode_of_procurement_id: attributes.mode_of_procurement_id ?? null,
                date: attributes.date ?? now.slice(0, 10),
                date_required: attributes.date_required || null,
                remarks_unit_head: null,
                remarks_division_fo_head: null,
                remarks_supply_officer: null,
                remarks_budget_officer: null,
                remarks_ord: null,
                created_at: now,
                updated_at: now,
            }

            this.procurements.push(procurement)

            const lot = this.addLot(procurement.id)

            this.attachments.push({ id: nextId(this.attachments), pr_id: procurement.id })

            return { procurement, lot }
        },

        update(id: number, attributes: Partial<Procurement>): void {
            const procurement = this.find(id)

            if (!procurement) {
                return
            }

            Object.assign(procurement, attributes, { updated_at: timestamp() })
        },

        destroy(id: number): void {
            for (const lot of this.lotsFor(id)) {
                this.items = this.items.filter((item) => item.lot_id !== lot.id)
            }

            this.lots = this.lots.filter((lot) => lot.procurement_id !== id)
            this.attachments = this.attachments.filter((row) => row.pr_id !== id)
            this.procurements = this.procurements.filter((row) => row.id !== id)
        },

        /** The requester sends the request on; it is locked from here. */
        submit(id: number): void {
            const procurement = this.find(id)

            if (!procurement) {
                return
            }

            procurement.procurement_status_id = PR_STATUS.submitted
            procurement.updated_at = timestamp()
        },

        /**
         * The requester pulls their own submission back. Only possible while it is
         * still merely Submitted and nobody has picked it up.
         */
        revert(id: number): void {
            const procurement = this.find(id)

            if (!procurement) {
                return
            }

            procurement.procurement_status_id = PR_STATUS.created
            procurement.updated_at = timestamp()
        },

        /* ----- Admin decisions ----- */

        /** Move the request one stage further along its route. */
        approve(id: number, remarks: string | null = null): void {
            const procurement = this.find(id)

            if (!procurement) {
                return
            }

            const column = this.remarksColumnForCurrentStage(procurement)

            if (column && remarks) {
                ;(procurement as unknown as Record<string, string | null>)[column] = remarks
            }

            const next = this.nextApprovalStatusId(procurement)

            if (next !== null) {
                procurement.procurement_status_id = next
            }

            procurement.updated_at = timestamp()
        },

        deny(id: number, remarks: string | null = null): void {
            this.recordDecision(id, PR_STATUS.denied, remarks)
        },

        returnForResubmission(id: number, remarks: string | null = null): void {
            this.recordDecision(id, PR_STATUS.forResubmission, remarks)
        },

        recordDecision(id: number, statusId: number, remarks: string | null): void {
            const procurement = this.find(id)

            if (!procurement) {
                return
            }

            const column = this.remarksColumnForCurrentStage(procurement)

            if (column && remarks) {
                ;(procurement as unknown as Record<string, string | null>)[column] = remarks
            }

            procurement.procurement_status_id = statusId
            procurement.updated_at = timestamp()
        },

        /* ----- Lots ----- */

        addLot(procurementId: number): Lot {
            const now = timestamp()

            const lot: Lot = {
                id: nextId(this.lots),
                procurement_id: procurementId,
                lot_no: this.lotsFor(procurementId).length + 1,
                created_at: now,
                updated_at: now,
            }

            this.lots.push(lot)

            return lot
        },

        /**
         * A lot can only be deleted while another remains, and only when it holds
         * no items — the guard the controller applied. The caller is told which
         * way it went so it can report the right message.
         */
        destroyLot(id: number): 'deleted' | 'blocked' {
            const lot = this.findLot(id)

            if (!lot) {
                return 'blocked'
            }

            if (this.itemsForLot(id).length > 0) {
                return 'blocked'
            }

            this.lots = this.lots.filter((row) => row.id !== id)
            this.renumberLots(lot.procurement_id)

            return 'deleted'
        },

        /** The last lot is emptied rather than removed. */
        clearLot(id: number): void {
            this.items = this.items.filter((item) => item.lot_id !== id)

            const lot = this.findLot(id)

            if (lot) {
                lot.updated_at = timestamp()
            }
        },

        renumberLots(procurementId: number): void {
            this.lotsFor(procurementId).forEach((lot, index) => {
                lot.lot_no = index + 1
            })
        },

        /* ----- Items ----- */

        addItem(attributes: Partial<PrItem> & { lot_id: number; item_name: string }): PrItem {
            const now = timestamp()
            const quantity = Number(attributes.quantity ?? 0)
            const unitCost = Number(attributes.unit_cost ?? 0)

            const item: PrItem = {
                id: nextId(this.items),
                lot_id: attributes.lot_id,
                ppmp_project_item_id: attributes.ppmp_project_item_id ?? null,
                item_name: attributes.item_name,
                item_description: attributes.item_description ?? '',
                unit_id: attributes.unit_id ?? 3,
                quantity,
                unit_cost: unitCost,
                total_unit_cost: attributes.total_unit_cost ?? quantity * unitCost,
                supply_officer_remarks: null,
                budget_officer_remarks: null,
                created_at: now,
                updated_at: now,
            }

            this.items.push(item)

            return item
        },

        updateItem(id: number, attributes: Partial<PrItem>): void {
            const item = this.findItem(id)

            if (!item) {
                return
            }

            Object.assign(item, attributes, { updated_at: timestamp() })

            item.total_unit_cost = Number(item.quantity) * Number(item.unit_cost)
        },

        destroyItem(id: number): void {
            this.items = this.items.filter((item) => item.id !== id)
        },

        /** Supply specifies what is bought; Budget prices it. */
        applyOfficerReview(
            id: number,
            attributes: Partial<PrItem>,
            office: 'supply' | 'budget',
        ): void {
            const item = this.findItem(id)

            if (!item) {
                return
            }

            Object.assign(item, attributes, { updated_at: timestamp() })

            if (office === 'budget') {
                item.total_unit_cost = Number(item.quantity) * Number(item.unit_cost)
            }
        },

        /* ----- Supporting documents ----- */

        /**
         * The demo records the chosen file's name rather than storing the file:
         * there is no disk behind this build, and the pages only ever show the
         * name and whether something is there.
         */
        storeDocument(procurementId: number, field: string, fileName: string): void {
            const attachment = this.ensureAttachment(procurementId)

            attachment[field] = fileName
        },

        removeDocument(procurementId: number, field: string): void {
            const attachment = this.ensureAttachment(procurementId)

            attachment[field] = null
        },

        ensureAttachment(procurementId: number): PrAttachment {
            const existing = this.attachmentFor(procurementId)

            if (existing) {
                return existing
            }

            const attachment: PrAttachment = { id: nextId(this.attachments), pr_id: procurementId }

            this.attachments.push(attachment)

            return attachment
        },
    },
})

function nextId(rows: { id: number }[]): number {
    return rows.reduce((highest, row) => Math.max(highest, row.id), 0) + 1
}

function timestamp(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
