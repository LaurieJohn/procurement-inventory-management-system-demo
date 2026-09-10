/**
 * Reference (lookup) data.
 *
 * These are the tables the Laravel build seeded once and never changed:
 * statuses, categories, modes of procurement, PR types and the like. The ids
 * are the ids the seeders produced, because the workflow rules keyed off them
 * (Procurement::SHORT_ROUTE_PR_TYPES, the PPMP status ids, the field-office
 * status ids) and those rules are reproduced verbatim in the stores.
 */

export interface Lookup {
    id: number
    name: string
}

/* ===================== PPMP ===================== */

/** pims_ppmp_types */
export const ppmpTypes: Lookup[] = [
    { id: 1, name: 'Indicative' },
    { id: 2, name: 'Final' },
    { id: 3, name: 'Updated' },
]

export interface PpmpStatus extends Lookup {
    /** Which office's workflow this status belongs to. */
    type: 'PPMP' | 'Unit' | 'Supply Officer' | 'Budget Officer'
}

/** pims_ppmp_statuses — one table shared by the plan and its field offices. */
export const ppmpStatuses: PpmpStatus[] = [
    { id: 1, type: 'PPMP', name: 'Created' },
    { id: 2, type: 'PPMP', name: 'Pending Field Offices' },
    { id: 3, type: 'PPMP', name: 'Closed' },
    { id: 4, type: 'PPMP', name: 'For Approval' },
    { id: 5, type: 'PPMP', name: 'Approved' },
    { id: 6, type: 'PPMP', name: 'Consolidated' },
    { id: 7, type: 'PPMP', name: 'For Approval of Consolidated' },
    { id: 8, type: 'PPMP', name: 'Approved Consolidated' },

    { id: 9, type: 'Unit', name: 'On-Going' },
    { id: 10, type: 'Unit', name: 'Pending' },
    { id: 11, type: 'Unit', name: 'Incomplete' },
    { id: 12, type: 'Unit', name: 'Completed' },

    { id: 13, type: 'Supply Officer', name: 'On-Going' },
    { id: 14, type: 'Supply Officer', name: 'Pending Resubmission' },
    { id: 15, type: 'Supply Officer', name: 'Approved' },
    { id: 16, type: 'Supply Officer', name: 'Closed' },
    { id: 17, type: 'Supply Officer', name: 'Re-Opened' },
    { id: 18, type: 'Supply Officer', name: 'Completed' },

    { id: 19, type: 'Budget Officer', name: 'On-Going' },
    { id: 20, type: 'Budget Officer', name: 'Pending' },
    { id: 21, type: 'Budget Officer', name: 'Closed' },
    { id: 22, type: 'Budget Officer', name: 'Completed' },
]

/** pims_ppmp_roles — the id decides what a page lets the viewer do. */
export const ppmpRoles: Lookup[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Division/Field Office Head' },
    { id: 3, name: 'Budget Officer' },
    { id: 4, name: 'Supply Officer' },
    { id: 5, name: 'Supply Designate' },
    { id: 6, name: 'Unit Head' },
    { id: 7, name: 'Employee' },
]

export const PPMP_ROLE = {
    admin: 1,
    fieldOfficeHead: 2,
    budgetOfficer: 3,
    supplyOfficer: 4,
    supplyDesignate: 5,
    unitHead: 6,
    employee: 7,
} as const

/** pims_ppmp_categories */
export const ppmpCategories: Lookup[] = [
    { id: 1, name: 'General Services' },
    { id: 2, name: 'Trainings, Meetings, Activities' },
    { id: 3, name: 'Rentals' },
    { id: 4, name: 'Fuel, Oil and Lubricants' },
    { id: 5, name: 'Insurance' },
    { id: 6, name: 'Printings and Publication' },
    { id: 7, name: 'Repairs and Maintenance' },
    { id: 8, name: 'Subscription Expenses and Other Expenses' },
    { id: 9, name: 'Travel Expenses, Transportation & Delivery Expenses' },
    { id: 10, name: 'Other Services' },
    { id: 11, name: 'Other Supplies and/or Materials' },
    { id: 12, name: 'Capital Outlay' },
    { id: 13, name: 'Miscellaneous Items (For Direct Acquisition only) Sec 32.2 of RA No. 12009' },
    { id: 14, name: 'Common Use Supplies and Equipment (CSE) to be purchased from PS-DBM (kindly indicate the summary/total amounts only)' },
]

export const ppmpProjectTypes: Lookup[] = [
    { id: 1, name: 'Goods and Services' },
    { id: 2, name: 'Infrastructure' },
    { id: 3, name: 'Services' },
]

export interface PpmpSubCategory extends Lookup {
    category_id: number
    project_type_id: number
}

/** pims_ppmp_sub_categories */
export const ppmpSubCategories: PpmpSubCategory[] = [
    { id: 1, category_id: 1, project_type_id: 1, name: 'Janitorial and Messengerial Services for the Regional Office and Field Offices for FY 2026' },
    { id: 2, category_id: 1, project_type_id: 1, name: 'Security Services for the Regional Office and Field Offices for FY 2026' },
    { id: 3, category_id: 1, project_type_id: 1, name: 'Photocopying Machines Rental (Colored and Black & White) for FY 2026' },
    { id: 4, category_id: 1, project_type_id: 1, name: 'Drinking Water (5 gallons/Bottle) with free Use Water Dispenser for CY 2026 in the Regional Office' },
    { id: 5, category_id: 1, project_type_id: 1, name: 'Printing Services and Accessories (free-use printers)' },
    { id: 6, category_id: 1, project_type_id: 1, name: 'Electricity, Water and Telephone Expenses for the Regional Office for CY 2026' },

    { id: 7, category_id: 2, project_type_id: 1, name: 'Catering Services (Meals) for the Implementation of various Agency Programs/Services for CY 2026 within the Region' },
    { id: 8, category_id: 2, project_type_id: 1, name: 'Lease of Venue with Catering Services (Meals) and Accommodation for the Implementation of various Agency Programs/Services for CY 2026 within the Region' },

    { id: 9, category_id: 3, project_type_id: 1, name: 'Office Space and Storage Room Rental for the Central Field Office' },
    { id: 10, category_id: 3, project_type_id: 1, name: 'Office Space Rental for the Eastern Field Office' },
    { id: 11, category_id: 3, project_type_id: 1, name: 'Office Space Rental for the Southern Field Office' },
    { id: 12, category_id: 3, project_type_id: 1, name: 'Office Space Rental for the Western Field Office' },
    { id: 13, category_id: 3, project_type_id: 1, name: 'Parking Space Rental for the Regional Office' },

    { id: 14, category_id: 4, project_type_id: 1, name: 'Motor Vehicles Fuel, Lubricants, Accessories & Services and other analogous needs' },

    { id: 15, category_id: 5, project_type_id: 1, name: 'Group Personal Accident Insurance for Program Beneficiaries' },
    { id: 16, category_id: 5, project_type_id: 1, name: 'Building and Property Insurance' },
    { id: 17, category_id: 5, project_type_id: 1, name: 'Property and Equipment Insurance' },
    { id: 18, category_id: 5, project_type_id: 1, name: 'Motor Vehicle Insurance' },

    { id: 19, category_id: 6, project_type_id: 1, name: 'Printing, production of Various Advocacy Materials and other materials/supplies' },
    { id: 20, category_id: 6, project_type_id: 1, name: 'Publication of Permit and Licensing Notices' },
    { id: 21, category_id: 6, project_type_id: 1, name: 'Printing of Tarpaulin, Streamers and Signages' },

    { id: 22, category_id: 7, project_type_id: 1, name: 'Motor Vehicles Maintenance, Repair and other Services for the Regional Office' },
    { id: 23, category_id: 7, project_type_id: 1, name: 'Repair and Maintenance of Various ICT Equipment' },
    { id: 24, category_id: 7, project_type_id: 1, name: 'Repair and Maintenance of Various Office Equipment' },
    { id: 25, category_id: 7, project_type_id: 1, name: 'Repair and Maintenance of Office Building and Spaces' },

    { id: 26, category_id: 8, project_type_id: 1, name: 'Supply and Delivery of 1-Year Contract of Web-Based Text Messaging Suite (Text Blasting)' },
    { id: 27, category_id: 8, project_type_id: 1, name: 'Supply and Delivery of 1-Year Subscription of SIP Trunk' },
    { id: 28, category_id: 8, project_type_id: 1, name: 'Supply and Delivery of 1-Year Subscription of Fiber Internet Connection' },
    { id: 29, category_id: 8, project_type_id: 1, name: '1-month subscription to Kahoot for National Statistics Month' },
    { id: 30, category_id: 8, project_type_id: 1, name: 'Internet Subscription Regionwide' },

    { id: 31, category_id: 9, project_type_id: 1, name: 'Airfare Expense for Various Official Travels of Agency Officials and Personnel for CY 2026' },
    { id: 32, category_id: 9, project_type_id: 1, name: 'Rents of Vehicle' },
    { id: 33, category_id: 9, project_type_id: 1, name: 'Postage and Courier Services for CY 2026' },

    { id: 34, category_id: 10, project_type_id: 3, name: 'Contract Notarization for Program Beneficiaries' },
    { id: 35, category_id: 10, project_type_id: 3, name: 'Information and Advocacy Services' },

    { id: 36, category_id: 11, project_type_id: 1, name: 'Various Office Supplies not available at PS-DBM' },
    { id: 37, category_id: 11, project_type_id: 1, name: 'Various Semi-Expendable Office Equipment' },
    { id: 38, category_id: 11, project_type_id: 1, name: 'Various Janitorial and Cleaning Supplies' },

    { id: 39, category_id: 12, project_type_id: 2, name: 'Construction / Improvement of Office Building' },
    { id: 40, category_id: 12, project_type_id: 1, name: 'Acquisition of Various ICT Equipment' },
    { id: 41, category_id: 12, project_type_id: 1, name: 'Acquisition of Motor Vehicle' },

    { id: 42, category_id: 13, project_type_id: 1, name: 'Miscellaneous Items for Direct Acquisition' },

    { id: 43, category_id: 14, project_type_id: 1, name: 'Common Use Supplies and Equipment (CSE) — PS-DBM' },
]

/** pims_ppmp_mode_procurements */
export const ppmpModeProcurements: Lookup[] = [
    { id: 1, name: 'Competitive Bidding' },
    { id: 2, name: 'Small Value Procurement' },
    { id: 3, name: 'Lease of Real Property and Venue' },
    { id: 4, name: 'Direct Contracting' },
    { id: 5, name: 'Direct Acquisition' },
    { id: 6, name: 'Repeat Order' },
    { id: 7, name: 'Agency to Agency' },
    { id: 8, name: 'Direct Retail Purchase of Petroleum Fuel, Oil, & Lubricant Products, Electronic Charging Devices and Online Subscriptions' },
    { id: 9, name: 'Two- failed biddings' },
    { id: 10, name: 'Emergency cases' },
    { id: 11, name: 'Limited source bidding' },
    { id: 12, name: 'Competitive Dialogue' },
    { id: 13, name: 'Unsolicited offer with bid matching' },
    { id: 14, name: 'Direct Sales' },
    { id: 15, name: 'Direct procurement for science, technology & innovation' },
    { id: 16, name: 'Take over of contracts' },
    { id: 17, name: 'Adjacent or contiguous' },
    { id: 18, name: 'Scientific, scholarly or artistic work, exclusive technology and media services' },
    { id: 19, name: 'Highly technical consultant' },
    { id: 20, name: 'Defense cooperation agreement and inventory- based items' },
    { id: 21, name: 'Non-government organization participation' },
    { id: 22, name: 'Community participation' },
    { id: 23, name: 'United nations agencies, international organizations or international financing institutions' },
]

/** pims_ppmp_source_funds */
export const ppmpSourceFunds: Lookup[] = [
    { id: 1, name: 'NEP' },
    { id: 2, name: 'GAA' },
]

/** pims_ppmp_quantity_type — also the unit of measure on Purchase Request items. */
export const quantityTypes: Lookup[] = [
    { id: 1, name: 'pax' },
    { id: 2, name: 'pc' },
    { id: 3, name: 'lot' },
    { id: 4, name: 'unit' },
    { id: 5, name: 'pack' },
    { id: 6, name: 'roll' },
    { id: 7, name: 'ream' },
    { id: 8, name: 'bottle' },
    { id: 9, name: 'box' },
    { id: 10, name: 'gallon' },
    { id: 11, name: 'liter' },
    { id: 12, name: 'canister' },
    { id: 13, name: 'subscription' },
]

/** pims_ppmp_item_status */
export const ppmpItemStatuses: Lookup[] = [
    { id: 1, name: 'New' },
    { id: 2, name: 'Readded' },
    { id: 3, name: 'Readded (Updated)' },
    { id: 4, name: 'Details Modified' },
    { id: 5, name: 'Budget Modified' },
]

/* ===================== Offices ===================== */

export interface AreaOffice {
    id: number
    name: string
    abbreviation: string
    area_office_head: string
    designation: string
}

/**
 * area_offices.
 *
 * The offices and the people heading them are invented for this demo — it
 * carries no real organisation's structure and no real person's name.
 */
export const areaOffices: AreaOffice[] = [
    { id: 1, name: 'Internal Management Services Division', abbreviation: 'IMSD', area_office_head: 'Teresa V. Buenaflor', designation: 'IMSD Head' },
    { id: 2, name: 'Technical Services and Support Division', abbreviation: 'TSSD', area_office_head: 'Arnel D. Mabini', designation: 'TSSD Head' },
    { id: 3, name: 'Legal Services Unit', abbreviation: 'LSU', area_office_head: 'Atty. Grace M. Ilagan', designation: 'Concurrent LSU Head' },
    { id: 4, name: 'Central Field Office', abbreviation: 'CFO', area_office_head: 'Lourdes P. Bituin', designation: 'Provincial Head' },
    { id: 5, name: 'Southern Field Office', abbreviation: 'SFO', area_office_head: 'Nestor A. Rivera', designation: 'Provincial Head' },
    { id: 6, name: 'Northern Field Office', abbreviation: 'NFO', area_office_head: 'Corazon T. Villamor', designation: 'Provincial Head' },
    { id: 7, name: 'Eastern Field Office', abbreviation: 'EFO', area_office_head: 'Emmanuel B. Carino', designation: 'Provincial Head' },
    { id: 8, name: 'Western Field Office', abbreviation: 'WFO', area_office_head: 'Alfredo S. Panganiban', designation: 'Provincial Head' },
    { id: 9, name: 'Highland Field Office', abbreviation: 'HFO', area_office_head: 'Marissa L. Domingo', designation: 'Provincial Head' },
]

/**
 * The abbreviations the PPMP show page lists down the Division/Field Office
 * card. Only ids 1–9 take part in a PPMP.
 */
export const fieldOfficeMap: Record<number, string> = {
    1: 'IMSD',
    2: 'TSSD',
    3: 'LSU',
    4: 'CFO',
    5: 'SFO',
    6: 'NFO',
    7: 'EFO',
    8: 'WFO',
    9: 'HFO',
}

/** office_units */
export const officeUnits: Lookup[] = [
    { id: 1, name: 'Administrative Unit' },
    { id: 2, name: 'Finance and Budget Unit' },
    { id: 3, name: 'Supply and Property Unit' },
    { id: 4, name: 'Information and Communications Technology Unit' },
    { id: 5, name: 'Human Resource Unit' },
    { id: 6, name: 'Labor Standards Enforcement Unit' },
    { id: 7, name: 'Labor Relations Unit' },
    { id: 8, name: 'Employment Promotion Unit' },
    { id: 9, name: 'Workers Welfare Unit' },
    { id: 10, name: 'Planning and Monitoring Unit' },
]

/* ===================== Purchase Request ===================== */

/** supply_pr_types */
export const prTypes: Lookup[] = [
    { id: 1, name: 'Common-Use Office Supplies' },
    { id: 2, name: 'Common-Use Office Supplies and Other Properties' },
    { id: 3, name: 'Materials' },
    { id: 4, name: 'ICT Equipment' },
    { id: 5, name: 'Services and Maintenance' },
    { id: 6, name: 'Infrastructure' },
    { id: 7, name: 'Consultancy' },
    { id: 8, name: 'Meals and Catering' },
    { id: 9, name: 'Meals (Direct Contracting)' },
    { id: 10, name: 'Lease of Venue' },
]

export interface ProcurementStatus {
    id: number
    type: string
}

/**
 * supply_procurement_statuses. Ids 1–4 predate the approval route and are kept
 * because the workflow constants point at them; 5–11 are the route itself.
 */
export const procurementStatuses: ProcurementStatus[] = [
    { id: 1, type: 'Created' },
    { id: 2, type: 'For Resubmission' },
    { id: 3, type: 'Denied' },
    { id: 4, type: 'Closed' },
    { id: 5, type: 'Submitted for Approval' },
    { id: 6, type: 'For Approval (Unit Head)' },
    { id: 7, type: 'For Approval (Division/FO Head)' },
    { id: 8, type: 'For Approval (Supply Officer)' },
    { id: 9, type: 'For Approval (Budget Officer)' },
    { id: 10, type: 'For Approval (ORD)' },
    { id: 11, type: 'Approved' },
]

/** supply_disbursement_types */
export const disbursementTypes: ProcurementStatus[] = [
    { id: 1, type: 'Petty Cash' },
    { id: 2, type: 'Cash Advance' },
    { id: 3, type: 'Reimbursement' },
    { id: 4, type: 'Regular Procurement' },
    { id: 5, type: 'Current Operating Expense (COE)' },
]

/** The officer who signs off every Purchase Request. */
export const APPROVING_OFFICER = 'ATTY. RICARDO M. ESTRELLA'
