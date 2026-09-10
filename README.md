# PIMS Demo

A front-end-only demonstration of a **Procurement and Inventory Management
System (PIMS)** — its two features, the **Project Procurement Management Plan
(PPMP)** and **Purchase Request (PR)**.

Built by **LaurieJohn** with Nuxt 3, Vue 3 and Pinia.

> Every name, office and figure in it is invented. It is a portfolio piece, not
> any organisation's system, and it holds no real data.

It is a Nuxt 3 single-page application. There is no server, no database and no
API: every page is rendered in the browser from the static data under `data/`,
which is what makes it deployable to Vercel as a plain static bundle.

## Running it

```bash
npm install
npm run dev
```

The app is served at <http://localhost:3000>.

```bash
npm run build      # production bundle
npm run generate   # fully static output, for a static host
npm run preview    # serve the production bundle locally
npx nuxt typecheck # type-check every page, component and store
```

## What is in it

| Area | Route | What it does |
| --- | --- | --- |
| Dashboard | `/dashboard` | Landing page with the two modules and their headline figures |
| PPMP | `/PIMS/PPMP` | The plans an office can open, its own project items, and the standing of every Division/Field Office |
| PPMP review | `/PIMS/PPMP/supply/{ppmp}/items/edit`, `/PIMS/PPMP/budget/{ppmp}/items/edit` | Supply revises the item details; Budget prices them |
| Purchase Request | `/PIMS/purchase-request` | Raise a request, break it into lots and items, upload its documents, submit it |
| PIMS administration | `/PIMS/admin` | Manage every PPMP and Purchase Request, and decide on submissions |

## How it is put together

```
data/          The seed data: reference tables, the demo's PPMPs and Purchase
               Requests, and the supporting-document rules per PR type
stores/        Pinia stores — the workflow lives here (approval routes, what
               locks when, which office may do what)
pages/         One page per route, mirroring the original URLs
components/    The shared pieces: the Argon layout chrome, the forms, the
               listing tables and the confirmation modals
composables/   Formatting helpers and the shared modal controller
public/argon/  The Argon Dashboard theme, trimmed to what these pages use
```

The stores load the seed data once and then mutate their own copies, so the demo
behaves like the real thing for the length of a session and starts clean on
reload.

### The signed-in account

Almost every PIMS page reads the viewer's PPMP role to decide what it offers, so
the account menu in the top right doubles as a role switcher: Admin, Supply
Officer, Budget Officer, Division/Field Office Head, Supply Designate, Unit Head
and Employee are all represented.

## Look and feel

The theme is Argon Dashboard (Bootstrap 4), served from `public/argon` exactly as
the original application served it. Nothing about the design, the fonts or the
markup was changed in the migration — only the tooling underneath it.

Bootstrap's own JavaScript is not loaded: dropdowns, collapsible sections and
modals are driven by Vue instead, using the same class names so they look and
animate the way Argon intends.
