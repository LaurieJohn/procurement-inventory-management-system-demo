# PIMS Demo — working notes

This repository is a **front-end-only demonstration** of a Procurement and
Inventory Management System (PIMS), built by LaurieJohn. It was migrated out of
a Laravel/Blade system: the PHP application, the database and every other module
(HR, Inspection Management, Knowledge Management, Cashier) were removed, and the
two PIMS features — **PPMP** and **Purchase Request** — were rebuilt in Nuxt.

**Keep it de-identified.** The data under `data/` is invented: the people, the
offices and the figures are all made up, and the original agency's name and logo
are deliberately absent. Do not reintroduce real names, logos or branding.

## Stack

- **Nuxt 3** with `ssr: false`. There is no server, no database and no API.
  Every page renders in the browser, which is what keeps the build a plain
  static bundle Vercel can serve without a Node function.
- **Pinia** for state. The stores are the application: they hold the data and
  the workflow rules.
- **Argon Dashboard (Bootstrap 4)**, served verbatim from `public/argon`.

Do not introduce a backend, a database, or an HTTP client. If a page needs data
it does not have, add it to `data/` or derive it in a store.

## Where things live

```
data/reference.ts    Lookup tables — statuses, categories, PR types, offices,
                     modes of procurement. The ids are the ids the old seeders
                     produced, because the workflow rules key off them.
data/demo.ts         The working data: users, PPMPs, project items, Purchase
                     Requests, lots, items, attachments.
data/documents.ts    Which documents each PR type calls for and which are
                     mandatory.
stores/              ppmp.ts, purchase-request.ts, auth.ts. The workflow lives
                     here, not in the pages.
pages/               One page per route. The URLs mirror the original ones.
components/          Layout chrome, shared forms, listing tables, modals.
composables/         useFormat (peso/date/plural), usePimsModal, useSidenav.
```

## Front-end conventions

- **This is Argon / Bootstrap 4, not Tailwind.** Copy a sibling page: `card
  shadow`, `card-header`, `thead-light`, `btn btn-sm btn-primary`, the
  Bootstrap 4 grid (`row` / `col-md-*`), and the `text-xs` / `text-muted`
  utility pair. Do not introduce Tailwind classes or `dark:` variants.
- **Wrap every on-screen `<table>` in `<div class="table-responsive">`**,
  including two-column key/value tables. Without it a wide table scrolls the
  whole page sideways on a phone instead of scrolling inside its own box.
- **Bootstrap's JavaScript is not loaded.** Dropdowns use `AppDropdown`,
  collapsible sidebar sections use a `ref` plus the `collapse`/`show` classes,
  and modals are rendered by Vue with `display` and `show` set directly. Never
  reach for jQuery or `data-toggle`.
- **Confirmations go through `usePimsModal()`**, which carries the shared PIMS
  markup: `confirm()` for anything destructive or workflow-changing, `notice()`
  for something that only needs acknowledging, `success()` for a completed
  action. Do not use `window.confirm` or SweetAlert.
- **Money and dates go through `composables/useFormat.ts`** — `peso()`,
  `amount()`, `count()`, `longDate()`, `longDateTime()`, `monthYear()`,
  `plural()`. They are auto-imported.
- **Assets are served locally, never from a CDN.** The theme lives in
  `public/argon` and has been trimmed to what these pages actually use; adding
  a CDN `<link>` or `<script>` would break the offline-capable build.

## Workflow rules worth knowing

These came out of the Laravel models and are reproduced in the stores. Change
them there, not in a page.

- A **Purchase Request** is editable only in `Created` or `For Resubmission`
  (`EDITABLE_STATUSES`). Everything else locks its details, lots, items and
  documents.
- Its **approval route** depends on the PR type: `SHORT_ROUTE_PR_TYPES` skip the
  Division/FO Head and Supply Officer stages and go straight to Budget.
- **Date Required/Needed** is mandatory for `DATE_REQUIRED_PR_TYPES`, and filing
  one of those inside `LATE_JUSTIFICATION_THRESHOLD_DAYS` adds a mandatory Late
  Justification Letter.
- A **PPMP** moves Created → Closed → For Approval → Approved; a field office
  whose status is in `FIELD_OFFICE_LOCKED` can no longer touch its items.
- Deciding on a submission is limited to the **Admin** and **Supply Officer**
  roles; every other role reads the same page without the controls.
- **Who sees which Purchase Request** is `visibleTo(viewerId, roleId)` on the
  store: an Employee sees only what they raised, a Unit Head sees their whole
  Unit, and every other role sees all of them. Both listings, both dashboards
  and every detail page go through it — a page that resolves a Purchase Request
  from the URL must call `canView()`, or the listing is only hiding rows the
  viewer can still reach by typing the address.

## Verifying a change

There are no unit tests. Type-check and build, then look at the affected page:

```bash
npx nuxt typecheck
npm run build
npm run dev
```
