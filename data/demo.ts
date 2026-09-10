/**
 * The demo's working data.
 *
 * This is what the database used to hold: the users, the PPMPs and their
 * project items, and the Purchase Requests with their lots, items and
 * supporting documents. The stores load these once and then mutate their own
 * copies, so the demo behaves like the real thing for the length of a session
 * and starts clean on reload.
 */

/* ===================== Users ===================== */

export interface DemoUser {
    id: number
    name: string
    first_name: string
    last_name: string
    /** area_offices.id — the Division/Field Office the user belongs to. */
    area_office_id: number
    office_unit_id: number
    /** pims_ppmp_roles.id — decides what every PIMS page lets this user do. */
    ppmp_role_id: number
    /** Super Admin sees every module and acts as PPMP Admin. */
    is_super_admin: boolean
}

export const users: DemoUser[] = [
    {
        id: 1,
        name: 'Maria Elena Santos',
        first_name: 'Maria Elena',
        last_name: 'Santos',
        area_office_id: 1,
        office_unit_id: 3,
        ppmp_role_id: 1,
        is_super_admin: true,
    },
    {
        id: 2,
        name: 'Ramon G. Alcantara',
        first_name: 'Ramon',
        last_name: 'Alcantara',
        area_office_id: 1,
        office_unit_id: 3,
        ppmp_role_id: 4,
        is_super_admin: false,
    },
    {
        id: 3,
        name: 'Cecilia B. Manalo',
        first_name: 'Cecilia',
        last_name: 'Manalo',
        area_office_id: 1,
        office_unit_id: 2,
        ppmp_role_id: 3,
        is_super_admin: false,
    },
    {
        id: 4,
        name: 'Teresa V. Buenaflor',
        first_name: 'Teresa',
        last_name: 'Buenaflor',
        area_office_id: 1,
        office_unit_id: 1,
        ppmp_role_id: 2,
        is_super_admin: false,
    },
    {
        id: 5,
        name: 'Jomar P. Villanueva',
        first_name: 'Jomar',
        last_name: 'Villanueva',
        area_office_id: 4,
        office_unit_id: 1,
        ppmp_role_id: 5,
        is_super_admin: false,
    },
    {
        id: 6,
        name: 'Anna Liza R. Ocampo',
        first_name: 'Anna Liza',
        last_name: 'Ocampo',
        area_office_id: 2,
        office_unit_id: 6,
        ppmp_role_id: 6,
        is_super_admin: false,
    },
    {
        id: 7,
        name: 'Kevin M. Dela Cruz',
        first_name: 'Kevin',
        last_name: 'Dela Cruz',
        area_office_id: 2,
        office_unit_id: 4,
        ppmp_role_id: 7,
        is_super_admin: false,
    },
    {
        // Sits in the Unit Head's own unit, so the Unit Head sees a colleague's
        // Purchase Request as well as their own.
        id: 8,
        name: 'Rowena F. Bautista',
        first_name: 'Rowena',
        last_name: 'Bautista',
        area_office_id: 2,
        office_unit_id: 6,
        ppmp_role_id: 7,
        is_super_admin: false,
    },
]

/** The account the demo opens as. */
export const DEFAULT_USER_ID = 1

/* ===================== PPMP ===================== */

export interface Ppmp {
    id: number
    user_id: number
    name: string
    /** pims_ppmp_types.id */
    type_id: number
    version_no: string | null
    fiscal_year: number
    year_status: string | null
    /** pims_ppmp_statuses.id, type 'PPMP' */
    status_id: number
    ppmp_deadline_at: string | null
    unit_deadline_at: string | null
    designate_deadline_at: string | null
    supply_deadline_at: string | null
    budget_deadline_at: string | null
    upload_deadline_at: string | null
    created_at: string
    updated_at: string
}

export const ppmps: Ppmp[] = [
    {
        id: 1,
        user_id: 1,
        name: 'FY 2027 Indicative Project Procurement Management Plan',
        type_id: 1,
        version_no: '1.0',
        fiscal_year: 2027,
        year_status: 'Current',
        status_id: 1,
        ppmp_deadline_at: '2026-10-31',
        unit_deadline_at: '2026-09-30',
        designate_deadline_at: '2026-10-15',
        supply_deadline_at: '2026-11-15',
        budget_deadline_at: '2026-11-30',
        upload_deadline_at: '2026-12-15',
        created_at: '2026-08-03 09:12:00',
        updated_at: '2026-09-05 14:40:00',
    },
    {
        id: 2,
        user_id: 1,
        name: 'FY 2026 Final Project Procurement Management Plan',
        type_id: 2,
        version_no: '2.1',
        fiscal_year: 2026,
        year_status: 'Previous',
        status_id: 5,
        ppmp_deadline_at: '2025-10-31',
        unit_deadline_at: '2025-09-30',
        designate_deadline_at: '2025-10-15',
        supply_deadline_at: '2025-11-15',
        budget_deadline_at: '2025-11-28',
        upload_deadline_at: '2025-12-12',
        created_at: '2025-08-11 08:30:00',
        updated_at: '2026-01-19 16:05:00',
    },
    {
        id: 3,
        user_id: 1,
        name: 'FY 2026 Updated Project Procurement Management Plan',
        type_id: 3,
        version_no: '2.2',
        fiscal_year: 2026,
        year_status: 'Current',
        status_id: 3,
        ppmp_deadline_at: '2026-07-31',
        unit_deadline_at: '2026-06-30',
        designate_deadline_at: '2026-07-15',
        supply_deadline_at: '2026-08-15',
        budget_deadline_at: '2026-08-31',
        upload_deadline_at: '2026-09-15',
        created_at: '2026-05-20 10:02:00',
        updated_at: '2026-08-28 11:47:00',
    },
]

export interface PpmpFieldOffice {
    id: number
    ppmp_id: number
    /** area_offices.id, restricted to 1–9. */
    field_office: number
    /** pims_ppmp_statuses.id, one of the Supply Officer statuses (13–18). */
    status_id: number
    uploaded_ppmp_form: string | null
    supply_officer_remarks: string | null
    ppmp_uploaded_at: string | null
}

export const ppmpFieldOffices: PpmpFieldOffice[] = [
    // FY 2027 Indicative — still being encoded.
    { id: 1, ppmp_id: 1, field_office: 1, status_id: 13, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },
    { id: 2, ppmp_id: 1, field_office: 2, status_id: 13, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },
    { id: 3, ppmp_id: 1, field_office: 3, status_id: 18, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },
    { id: 4, ppmp_id: 1, field_office: 4, status_id: 14, uploaded_ppmp_form: null, supply_officer_remarks: 'Column 9 amounts do not match the attached quotation. Please revise and resubmit.', ppmp_uploaded_at: '2026-09-02 15:20:00' },
    { id: 5, ppmp_id: 1, field_office: 5, status_id: 13, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },
    { id: 6, ppmp_id: 1, field_office: 6, status_id: 15, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: '2026-09-04 09:10:00' },
    { id: 7, ppmp_id: 1, field_office: 7, status_id: 13, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },

    // FY 2026 Final — approved all round.
    { id: 8, ppmp_id: 2, field_office: 1, status_id: 15, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: '2025-12-08 10:00:00' },
    { id: 9, ppmp_id: 2, field_office: 2, status_id: 15, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: '2025-12-09 11:30:00' },
    { id: 10, ppmp_id: 2, field_office: 4, status_id: 15, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: '2025-12-10 08:45:00' },

    // FY 2026 Updated — closed for review.
    { id: 11, ppmp_id: 3, field_office: 1, status_id: 16, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },
    { id: 12, ppmp_id: 3, field_office: 2, status_id: 16, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },
    { id: 13, ppmp_id: 3, field_office: 8, status_id: 16, uploaded_ppmp_form: null, supply_officer_remarks: null, ppmp_uploaded_at: null },
]

export interface PpmpItem {
    id: number
    ppmp_id: number
    user_id: number
    fieldoffice_id: number
    unit_id: number | null
    /** pims_ppmp_item_status.id */
    status: number
    title: string
    category_id: number
    sub_category_id: number
    project_type_id: number
    /** Free text: "Quantity and Size of the Project to be Procured". */
    quantity: string
    /** quantityTypes.id */
    quantity_type: number | null
    amount: number
    mode_procurement_id: number
    pre_procurement_status: boolean
    /** YYYY-MM — the projected timeline columns. */
    start_date: string | null
    end_date: string | null
    expected_date: string | null
    source_fund_id: number
    attached_documents: string | null
    remarks: string | null
    supply_remarks: string | null
    budget_remarks: string | null
    supply_modified: number | null
    budget_modified: number | null
    created_at: string
    updated_at: string
}

export const ppmpItems: PpmpItem[] = [
    {
        id: 1, ppmp_id: 1, user_id: 1, fieldoffice_id: 1, unit_id: 3, status: 1,
        title: 'Janitorial and Messengerial Services for the Regional Office and Field Offices',
        category_id: 1, sub_category_id: 1, project_type_id: 1,
        quantity: '12 months', quantity_type: 3, amount: 4_320_000,
        mode_procurement_id: 1, pre_procurement_status: true,
        start_date: '2026-11', end_date: '2026-12', expected_date: '2027-01',
        source_fund_id: 1, attached_documents: null,
        remarks: 'Regionwide contract, renewed annually.',
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-08-05 09:30:00', updated_at: '2026-08-05 09:30:00',
    },
    {
        id: 2, ppmp_id: 1, user_id: 1, fieldoffice_id: 1, unit_id: 3, status: 1,
        title: 'Security Services for the Regional Office and Field Offices',
        category_id: 1, sub_category_id: 2, project_type_id: 1,
        quantity: '12 months', quantity_type: 3, amount: 3_960_000,
        mode_procurement_id: 1, pre_procurement_status: true,
        start_date: '2026-11', end_date: '2026-12', expected_date: '2027-01',
        source_fund_id: 1, attached_documents: null,
        remarks: null,
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-08-05 09:45:00', updated_at: '2026-08-05 09:45:00',
    },
    {
        id: 3, ppmp_id: 1, user_id: 1, fieldoffice_id: 1, unit_id: 4, status: 4,
        title: 'Supply and Delivery of 1-Year Subscription of Fiber Internet Connection',
        category_id: 8, sub_category_id: 28, project_type_id: 1,
        quantity: '1 subscription', quantity_type: 13, amount: 480_000,
        mode_procurement_id: 2, pre_procurement_status: false,
        start_date: '2026-12', end_date: '2027-01', expected_date: '2027-02',
        source_fund_id: 1, attached_documents: 'https://drive.google.com/file/d/demo-internet-quotation',
        remarks: 'Upgrade from 300 Mbps to 500 Mbps.',
        supply_remarks: 'Unit of measurement corrected to subscription.', budget_remarks: null,
        supply_modified: 1, budget_modified: null,
        created_at: '2026-08-06 13:15:00', updated_at: '2026-09-01 10:20:00',
    },
    {
        id: 4, ppmp_id: 1, user_id: 5, fieldoffice_id: 4, unit_id: 1, status: 1,
        title: 'Office Space and Storage Room Rental for the Central Field Office',
        category_id: 3, sub_category_id: 9, project_type_id: 1,
        quantity: '12 months', quantity_type: 3, amount: 720_000,
        mode_procurement_id: 3, pre_procurement_status: false,
        start_date: '2026-11', end_date: '2026-12', expected_date: '2027-01',
        source_fund_id: 1, attached_documents: null,
        remarks: null,
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-08-08 08:05:00', updated_at: '2026-08-08 08:05:00',
    },
    {
        id: 5, ppmp_id: 1, user_id: 5, fieldoffice_id: 4, unit_id: 1, status: 1,
        title: 'Motor Vehicles Fuel, Lubricants, Accessories and other analogous needs',
        category_id: 4, sub_category_id: 14, project_type_id: 1,
        quantity: '6,000 liters', quantity_type: 11, amount: 390_000,
        mode_procurement_id: 8, pre_procurement_status: false,
        start_date: '2026-12', end_date: '2027-01', expected_date: '2027-01',
        source_fund_id: 1, attached_documents: null,
        remarks: 'Covers two service vehicles.',
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-08-08 08:20:00', updated_at: '2026-08-08 08:20:00',
    },
    {
        id: 6, ppmp_id: 1, user_id: 6, fieldoffice_id: 2, unit_id: 6, status: 1,
        title: 'Catering Services (Meals) for the Implementation of various Agency Programs',
        category_id: 2, sub_category_id: 7, project_type_id: 1,
        quantity: '2,500 pax', quantity_type: 1, amount: 1_250_000,
        mode_procurement_id: 2, pre_procurement_status: false,
        start_date: '2026-12', end_date: '2027-01', expected_date: '2027-03',
        source_fund_id: 1, attached_documents: null,
        remarks: null,
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-08-12 15:40:00', updated_at: '2026-08-12 15:40:00',
    },
    {
        id: 7, ppmp_id: 1, user_id: 7, fieldoffice_id: 2, unit_id: 4, status: 5,
        title: 'Acquisition of Various ICT Equipment (Laptops and Printers)',
        category_id: 12, sub_category_id: 40, project_type_id: 1,
        quantity: '25 units', quantity_type: 4, amount: 1_875_000,
        mode_procurement_id: 1, pre_procurement_status: true,
        start_date: '2027-01', end_date: '2027-02', expected_date: '2027-04',
        source_fund_id: 1, attached_documents: 'https://drive.google.com/file/d/demo-ict-isa',
        remarks: 'Replacement of units beyond serviceable life.',
        supply_remarks: null, budget_remarks: 'Ceiling reduced to the approved ICT allocation.',
        supply_modified: null, budget_modified: 1,
        created_at: '2026-08-14 11:05:00', updated_at: '2026-09-03 09:15:00',
    },
    {
        id: 8, ppmp_id: 1, user_id: 7, fieldoffice_id: 2, unit_id: 4, status: 1,
        title: 'Repair and Maintenance of Various ICT Equipment',
        category_id: 7, sub_category_id: 23, project_type_id: 1,
        quantity: '1 lot', quantity_type: 3, amount: 250_000,
        mode_procurement_id: 2, pre_procurement_status: false,
        start_date: '2026-12', end_date: '2027-01', expected_date: '2027-02',
        source_fund_id: 1, attached_documents: null,
        remarks: null,
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-08-14 11:20:00', updated_at: '2026-08-14 11:20:00',
    },
    {
        id: 9, ppmp_id: 2, user_id: 1, fieldoffice_id: 1, unit_id: 3, status: 1,
        title: 'Drinking Water (5 gallons/Bottle) with free-use Water Dispenser',
        category_id: 1, sub_category_id: 4, project_type_id: 1,
        quantity: '1,200 gallons', quantity_type: 10, amount: 96_000,
        mode_procurement_id: 2, pre_procurement_status: false,
        start_date: '2025-11', end_date: '2025-12', expected_date: '2026-01',
        source_fund_id: 2, attached_documents: null,
        remarks: null,
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2025-08-20 10:00:00', updated_at: '2025-11-14 16:00:00',
    },
    {
        id: 10, ppmp_id: 2, user_id: 1, fieldoffice_id: 1, unit_id: 3, status: 1,
        title: 'Photocopying Machines Rental (Colored and Black & White)',
        category_id: 1, sub_category_id: 3, project_type_id: 1,
        quantity: '6 units', quantity_type: 4, amount: 432_000,
        mode_procurement_id: 3, pre_procurement_status: false,
        start_date: '2025-11', end_date: '2025-12', expected_date: '2026-01',
        source_fund_id: 2, attached_documents: null,
        remarks: null,
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2025-08-20 10:25:00', updated_at: '2025-11-14 16:00:00',
    },
    {
        id: 11, ppmp_id: 3, user_id: 1, fieldoffice_id: 1, unit_id: 3, status: 2,
        title: 'Various Office Supplies not available at PS-DBM',
        category_id: 11, sub_category_id: 36, project_type_id: 1,
        quantity: '1 lot', quantity_type: 3, amount: 640_000,
        mode_procurement_id: 2, pre_procurement_status: false,
        start_date: '2026-06', end_date: '2026-07', expected_date: '2026-08',
        source_fund_id: 2, attached_documents: null,
        remarks: 'Carried over from the Final PPMP.',
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-05-22 09:00:00', updated_at: '2026-05-22 09:00:00',
    },
    {
        id: 12, ppmp_id: 3, user_id: 6, fieldoffice_id: 2, unit_id: 6, status: 1,
        title: 'Printing of Tarpaulin, Streamers and Signages',
        category_id: 6, sub_category_id: 21, project_type_id: 1,
        quantity: '150 pcs', quantity_type: 2, amount: 180_000,
        mode_procurement_id: 2, pre_procurement_status: false,
        start_date: '2026-06', end_date: '2026-07', expected_date: '2026-07',
        source_fund_id: 2, attached_documents: null,
        remarks: null,
        supply_remarks: null, budget_remarks: null, supply_modified: null, budget_modified: null,
        created_at: '2026-05-23 14:10:00', updated_at: '2026-05-23 14:10:00',
    },
]

/* ===================== Purchase Request ===================== */

export interface Procurement {
    id: number
    user_id: number
    disbursement_id: number | null
    request_by: string
    approved_by: string
    title: string
    description: string
    /** supply_procurement_statuses.id */
    procurement_status_id: number
    /** supply_pr_types.id */
    pr_type_id: number | null
    mode_of_procurement_id: number | null
    /** YYYY-MM-DD */
    date: string
    date_required: string | null
    remarks_unit_head: string | null
    remarks_division_fo_head: string | null
    remarks_supply_officer: string | null
    remarks_budget_officer: string | null
    remarks_ord: string | null
    created_at: string
    updated_at: string
}

export const procurements: Procurement[] = [
    {
        id: 1, user_id: 1, disbursement_id: 4,
        request_by: 'TERESA V. BUENAFLOR', approved_by: 'ATTY. RICARDO M. ESTRELLA',
        title: 'Supply and Delivery of Various ICT Equipment for the Regional Office',
        description: 'Procurement of laptops, printers and network switches to replace units that are beyond their serviceable life.',
        procurement_status_id: 1, pr_type_id: 4, mode_of_procurement_id: 1,
        date: '2026-09-01', date_required: null,
        remarks_unit_head: null, remarks_division_fo_head: null, remarks_supply_officer: null,
        remarks_budget_officer: null, remarks_ord: null,
        created_at: '2026-09-01 09:15:00', updated_at: '2026-09-08 11:00:00',
    },
    {
        id: 2, user_id: 1, disbursement_id: 4,
        request_by: 'TERESA V. BUENAFLOR', approved_by: 'ATTY. RICARDO M. ESTRELLA',
        title: 'Catering Services for the Regional Tripartite Consultation',
        description: 'Meals and snacks for 180 participants over two days at the Regional Office training hall.',
        procurement_status_id: 5, pr_type_id: 8, mode_of_procurement_id: 2,
        date: '2026-08-26', date_required: '2026-10-14',
        remarks_unit_head: null, remarks_division_fo_head: null, remarks_supply_officer: null,
        remarks_budget_officer: null, remarks_ord: null,
        created_at: '2026-08-26 13:40:00', updated_at: '2026-09-04 08:30:00',
    },
    {
        id: 3, user_id: 6, disbursement_id: 4,
        request_by: 'ARNEL D. MABINI', approved_by: 'ATTY. RICARDO M. ESTRELLA',
        title: 'Repair and Maintenance of Office Air-Conditioning Units',
        description: 'General cleaning, freon recharge and replacement of defective compressors for 14 split-type units.',
        procurement_status_id: 9, pr_type_id: 5, mode_of_procurement_id: 2,
        date: '2026-08-12', date_required: null,
        remarks_unit_head: 'Endorsed. Units are within the approved maintenance plan.',
        remarks_division_fo_head: 'Cleared for Supply review.',
        remarks_supply_officer: 'Scope of work matches the preinspection report.',
        remarks_budget_officer: null, remarks_ord: null,
        created_at: '2026-08-12 10:05:00', updated_at: '2026-09-02 15:12:00',
    },
    {
        id: 4, user_id: 1, disbursement_id: 4,
        request_by: 'TERESA V. BUENAFLOR', approved_by: 'ATTY. RICARDO M. ESTRELLA',
        title: 'Supply and Delivery of Common-Use Office Supplies (3rd Quarter)',
        description: 'Quarterly replenishment of common-use office supplies for the Regional Office and Field Offices.',
        procurement_status_id: 11, pr_type_id: 1, mode_of_procurement_id: 7,
        date: '2026-06-30', date_required: null,
        remarks_unit_head: 'Endorsed.',
        remarks_division_fo_head: 'Endorsed.',
        remarks_supply_officer: 'Stock position attached and verified.',
        remarks_budget_officer: 'Funds available under the approved allotment.',
        remarks_ord: 'Approved.',
        created_at: '2026-06-30 08:00:00', updated_at: '2026-07-21 16:45:00',
    },
    {
        id: 5, user_id: 8, disbursement_id: 4,
        request_by: 'ARNEL D. MABINI', approved_by: 'ATTY. RICARDO M. ESTRELLA',
        title: 'Lease of Venue for the Regional Planning Conference',
        description: 'Function room with accommodation for 90 participants for three days.',
        procurement_status_id: 2, pr_type_id: 10, mode_of_procurement_id: 3,
        date: '2026-08-19', date_required: '2026-09-25',
        remarks_unit_head: null,
        remarks_division_fo_head: null,
        remarks_supply_officer: 'Only one inquiry confirmation slip was attached. Attach the list of inquired GOCC/NGA venues and resubmit.',
        remarks_budget_officer: null, remarks_ord: null,
        created_at: '2026-08-19 14:25:00', updated_at: '2026-08-29 09:50:00',
    },
    {
        id: 6, user_id: 7, disbursement_id: 4,
        request_by: 'ARNEL D. MABINI', approved_by: 'ATTY. RICARDO M. ESTRELLA',
        title: 'Procurement of Construction Materials for the Records Room Partition',
        description: 'Materials for the partitioning of the records storage room at the Regional Office annex.',
        procurement_status_id: 3, pr_type_id: 3, mode_of_procurement_id: 2,
        date: '2026-07-08', date_required: null,
        remarks_unit_head: null, remarks_division_fo_head: null,
        remarks_supply_officer: 'Item specification does not match the approved PPMP entry.',
        remarks_budget_officer: 'No available allotment for this activity within the quarter.',
        remarks_ord: null,
        created_at: '2026-07-08 11:30:00', updated_at: '2026-07-30 10:15:00',
    },
]

export interface Lot {
    id: number
    procurement_id: number
    lot_no: number
    created_at: string
    updated_at: string
}

export const lots: Lot[] = [
    { id: 1, procurement_id: 1, lot_no: 1, created_at: '2026-09-01 09:16:00', updated_at: '2026-09-01 10:40:00' },
    { id: 2, procurement_id: 1, lot_no: 2, created_at: '2026-09-01 10:45:00', updated_at: '2026-09-08 11:00:00' },
    { id: 3, procurement_id: 2, lot_no: 1, created_at: '2026-08-26 13:41:00', updated_at: '2026-08-26 14:20:00' },
    { id: 4, procurement_id: 3, lot_no: 1, created_at: '2026-08-12 10:06:00', updated_at: '2026-08-12 11:10:00' },
    { id: 5, procurement_id: 4, lot_no: 1, created_at: '2026-06-30 08:01:00', updated_at: '2026-06-30 09:30:00' },
    { id: 6, procurement_id: 5, lot_no: 1, created_at: '2026-08-19 14:26:00', updated_at: '2026-08-19 15:00:00' },
    { id: 7, procurement_id: 6, lot_no: 1, created_at: '2026-07-08 11:31:00', updated_at: '2026-07-08 12:05:00' },
]

export interface PrItem {
    id: number
    lot_id: number
    /** pims_ppmp_items1.id — the PPMP entry this item is drawn from. */
    ppmp_project_item_id: number | null
    item_name: string
    item_description: string
    /** quantityTypes.id */
    unit_id: number
    quantity: number
    unit_cost: number
    total_unit_cost: number
    supply_officer_remarks: string | null
    budget_officer_remarks: string | null
    created_at: string
    updated_at: string
}

export const prItems: PrItem[] = [
    {
        id: 1, lot_id: 1, ppmp_project_item_id: 7,
        item_name: 'Laptop Computer',
        item_description: '* Intel Core i7 (14th generation) or higher\n* 16GB DDR5 RAM, 512GB NVMe SSD\n* 14-inch FHD display\n* Pre-installed licensed operating system\n* Three-year on-site warranty',
        unit_id: 4, quantity: 20, unit_cost: 62_500, total_unit_cost: 1_250_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-09-01 09:30:00', updated_at: '2026-09-01 09:30:00',
    },
    {
        id: 2, lot_id: 1, ppmp_project_item_id: 7,
        item_name: 'Multifunction Laser Printer',
        item_description: '* Print, scan, copy and fax\n* Duplex printing, network ready\n* Minimum 35 ppm mono output',
        unit_id: 4, quantity: 5, unit_cost: 42_000, total_unit_cost: 210_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-09-01 09:44:00', updated_at: '2026-09-01 09:44:00',
    },
    {
        id: 3, lot_id: 2, ppmp_project_item_id: 7,
        item_name: 'Managed Network Switch',
        item_description: '* 24-port Gigabit managed switch\n* Rack mountable, with mounting kit\n* Lifetime hardware warranty',
        unit_id: 4, quantity: 4, unit_cost: 28_500, total_unit_cost: 114_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-09-01 10:50:00', updated_at: '2026-09-01 10:50:00',
    },
    {
        id: 4, lot_id: 3, ppmp_project_item_id: 6,
        item_name: 'Meals and Snacks Package',
        item_description: '* AM snack, lunch and PM snack\n* Buffet service with function room set-up\n* Two days, 180 participants per day',
        unit_id: 1, quantity: 360, unit_cost: 750, total_unit_cost: 270_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-08-26 13:55:00', updated_at: '2026-08-26 13:55:00',
    },
    {
        id: 5, lot_id: 4, ppmp_project_item_id: 8,
        item_name: 'Air-Conditioning Unit General Cleaning',
        item_description: '* General cleaning and freon recharge\n* Includes chemical wash of coils and drain lines',
        unit_id: 4, quantity: 14, unit_cost: 3_500, total_unit_cost: 49_000,
        supply_officer_remarks: 'Confirmed against the preinspection report.', budget_officer_remarks: null,
        created_at: '2026-08-12 10:20:00', updated_at: '2026-08-30 09:00:00',
    },
    {
        id: 6, lot_id: 4, ppmp_project_item_id: 8,
        item_name: 'Compressor Replacement',
        item_description: '* Replacement of defective compressors\n* Includes labour and one-year warranty on parts',
        unit_id: 4, quantity: 3, unit_cost: 24_000, total_unit_cost: 72_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-08-12 10:35:00', updated_at: '2026-08-12 10:35:00',
    },
    {
        id: 7, lot_id: 5, ppmp_project_item_id: 11,
        item_name: 'Bond Paper, A4, 80gsm',
        item_description: '* Substance 20, 500 sheets per ream\n* Delivered by the box (10 reams per box)',
        unit_id: 7, quantity: 600, unit_cost: 245, total_unit_cost: 147_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-06-30 08:20:00', updated_at: '2026-06-30 08:20:00',
    },
    {
        id: 8, lot_id: 5, ppmp_project_item_id: 11,
        item_name: 'Toner Cartridge (Assorted)',
        item_description: '* Original manufacturer cartridges only\n* Assorted models per attached list',
        unit_id: 2, quantity: 90, unit_cost: 4_100, total_unit_cost: 369_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-06-30 08:55:00', updated_at: '2026-06-30 08:55:00',
    },
    {
        id: 9, lot_id: 6, ppmp_project_item_id: 6,
        item_name: 'Function Room with Accommodation',
        item_description: '* Function room for 90 participants\n* Twin-sharing accommodation, three days two nights\n* Inclusive of meals and audio-visual equipment',
        unit_id: 1, quantity: 90, unit_cost: 6_800, total_unit_cost: 612_000,
        supply_officer_remarks: null, budget_officer_remarks: null,
        created_at: '2026-08-19 14:40:00', updated_at: '2026-08-19 14:40:00',
    },
    {
        id: 10, lot_id: 7, ppmp_project_item_id: 11,
        item_name: 'Gypsum Board Partition Materials',
        item_description: '* Gypsum boards, metal studs and fasteners\n* Per attached bill of materials',
        unit_id: 3, quantity: 1, unit_cost: 185_000, total_unit_cost: 185_000,
        supply_officer_remarks: 'Specification does not match the approved PPMP entry.', budget_officer_remarks: null,
        created_at: '2026-07-08 11:45:00', updated_at: '2026-07-25 10:00:00',
    },
]

/**
 * supply_pr_attachments — one row per Purchase Request. A value is the stored
 * file name; null means the document has not been uploaded.
 */
export interface PrAttachment {
    id: number
    pr_id: number
    [document: string]: number | string | null
}

export const prAttachments: PrAttachment[] = [
    {
        id: 1, pr_id: 1,
        justification_letter: 'justification-letter-pr-1.pdf',
        approved_ppmp_proposal: 'approved-ppmp-proposal-pr-1.pdf',
        technical_specification: null,
        preinspection_report: null,
        isa_recommendation_letter: null,
    },
    {
        id: 2, pr_id: 2,
        justification_letter: 'justification-letter-pr-2.pdf',
        approved_activity_proposal: 'approved-activity-proposal-pr-2.pdf',
        service_request_form: 'service-request-form-pr-2.pdf',
    },
    {
        id: 3, pr_id: 3,
        justification_letter: 'justification-letter-pr-3.pdf',
        maintenance_plan: 'maintenance-plan-pr-3.pdf',
        preinspection_report: 'preinspection-report-pr-3.pdf',
    },
    {
        id: 4, pr_id: 4,
        justification_letter: 'justification-letter-pr-4.pdf',
        approved_activity_proposal: 'approved-activity-proposal-pr-4.pdf',
        app_cse_activity_proposal: 'app-cse-activity-proposal-pr-4.pdf',
        cnas_ps_dbm: 'cnas-ps-dbm-pr-4.pdf',
        stock_position: 'stock-position-pr-4.pdf',
    },
    {
        id: 5, pr_id: 5,
        justification_letter: 'justification-letter-pr-5.pdf',
        approved_activity_proposal: 'approved-activity-proposal-pr-5.pdf',
        list_inquired_gocc_nga: null,
        letter_inquiry_confirmation_slip: 'letter-inquiry-confirmation-slip-pr-5.pdf',
    },
    {
        id: 6, pr_id: 6,
        justification_letter: 'justification-letter-pr-6.pdf',
        approved_ppmp_proposal: 'approved-ppmp-proposal-pr-6.pdf',
        item_specification: 'item-specification-pr-6.pdf',
    },
]
