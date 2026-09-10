/**
 * The supporting-document rules for a Purchase Request: which documents each
 * PR type calls for, which of those are mandatory, and how they are described
 * to a page.
 *
 * Ported from the ResolvesPurchaseRequestDocuments trait so the requester page,
 * the attachments page and the admin review can never disagree about what a
 * Purchase Request owes.
 */

/**
 * Every supporting document a Purchase Request accepts, mapped to the label
 * shown on the attachments page. The keys are the columns the attachments row
 * carries.
 */
export const DOCUMENTS: Record<string, string> = {
    justification_letter: 'Justification Letter',
    late_justification_letter: 'Late Justification Letter',
    approved_activity_proposal: 'Approved Activity Proposal',
    approved_ppmp_proposal: 'Approved PPMP Proposal',
    service_request_form: 'Service Request Form',
    letter_exclusivity_supplier: 'Letter of Exclusivity Supplier',
    list_inquired_gocc_nga: 'List Inquired GOCC/NGA',
    letter_inquiry_confirmation_slip: 'Letter Inquiry Confirmation Slip',
    item_specification: 'Item Specification',
    technical_specification: 'Technical Specification',
    preinspection_report: 'Preinspection Report',
    isa_recommendation_letter: 'ISA Recommendation Letter',
    app_cse_activity_proposal: 'APP CSE Activity Proposal',
    cnas_ps_dbm: 'CNAS / PS-DBM',
    stock_position: 'Stock Position',
    maintenance_plan: 'Maintenance Plan',
    proposal_plans: 'Proposal Plans',
    scope_of_work: 'Scope of Work',
    terms_of_reference: 'Terms of Reference',
}

/** Largest accepted size for a single supporting document, in kilobytes. */
export const MAX_UPLOAD_KILOBYTES = 10240

/**
 * Documents offered for every Purchase Request whatever its type. These are
 * always listed first and are never mandatory.
 */
export const UNIVERSAL_DOCUMENTS = ['justification_letter']

/**
 * Document demanded only when a date-driven Purchase Request is filed with
 * less than its expected lead time.
 */
export const LATE_JUSTIFICATION_DOCUMENT = 'late_justification_letter'

/**
 * Supporting documents each PR type calls for, keyed by supply_pr_types.id and
 * mapped to whether that document is mandatory. Declaration order is the order
 * the cards appear in.
 */
export const DOCUMENT_REQUIREMENTS: Record<number, Record<string, boolean>> = {
    // Common-Use Office Supplies
    1: {
        app_cse_activity_proposal: false,
        approved_activity_proposal: true,
        technical_specification: false,
        cnas_ps_dbm: true,
        stock_position: true,
    },
    // Common-Use Office Supplies and Other Properties
    2: {
        approved_ppmp_proposal: true,
        item_specification: false,
        preinspection_report: false,
    },
    // Materials
    3: {
        approved_ppmp_proposal: true,
        item_specification: true,
    },
    // ICT Equipment
    4: {
        approved_ppmp_proposal: true,
        technical_specification: false,
        preinspection_report: false,
        isa_recommendation_letter: true,
    },
    // Services and Maintenance
    5: {
        maintenance_plan: true,
        preinspection_report: true,
    },
    // Infrastructure
    6: {
        proposal_plans: true,
        scope_of_work: true,
    },
    // Consultancy
    7: {
        approved_activity_proposal: true,
        terms_of_reference: true,
    },
    // Meals and Catering
    8: {
        approved_activity_proposal: true,
        service_request_form: true,
    },
    // Meals (Direct Contracting)
    9: {
        approved_activity_proposal: true,
        letter_exclusivity_supplier: true,
    },
    // Lease of Venue
    10: {
        approved_activity_proposal: true,
        list_inquired_gocc_nga: true,
        letter_inquiry_confirmation_slip: true,
    },
}

/** One document as the upload cards and the summary chips read it. */
export interface DocumentView {
    field: string
    label: string
    name: string | null
    stored: boolean
    required: boolean
    applicable: boolean
}
