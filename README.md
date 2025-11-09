# Cement Sales & Logistics System

A full-stack TypeScript application for managing cement sales, inventory and logistics.  
Frontend: Vite + React + TypeScript. Backend: Node.js + Express + TypeScript. Database: MongoDB with mongoose.

---

## Quick Links

- Project root: [package.json](package.json)  
- Client app: [client/README.md](client/README.md) · source: [client/src](client/src)  
- Server app: [server/src](server/src)  
- Project configuration: [vite.config.ts](client/vite.config.ts)

Key code entrypoints & helpers:
- Frontend app bootstrap: [`App`](client/src/App.tsx) ([file](client/src/App.tsx))  
- Frontend API client: [`apiClient`](client/src/lib/api.ts) ([file](client/src/lib/api.ts))  
- Auth store (zustand): [`useAuthStore`](client/src/store/authStore.ts) ([file](client/src/store/authStore.ts))  
- Backend server entry: [`server`](server/src/server.ts) ([file](server/src/server.ts))  
- Reports controller: [`getReports` et al. in report.controller.ts](server/src/controllers/report.controller.ts) ([file](server/src/controllers/report.controller.ts))  
- DB seed script: [server/src/scripts/seed.ts](server/src/scripts/seed.ts)  
- DB clear script (preserve admin): [server/src/scripts/clearDB.ts](server/src/scripts/clearDB.ts)  
- Inventory sync script: [server/src/scripts/syncInventory.ts](server/src/scripts/syncInventory.ts)  
- Mongoose route model: [server/src/models/Route.ts](server/src/models/Route.ts)

UI pages/components of interest:
- Admin Dashboard: [`Dashboard`](client/src/pages/Admin/dashboard/Dashboard.tsx) ([file](client/src/pages/Admin/dashboard/Dashboard.tsx))  
- Reports: [`ReportsPage`](client/src/pages/Admin/Reports/ReportsPage.tsx) ([file](client/src/pages/Admin/Reports/ReportsPage.tsx)) and exports from [client/src/components/reports/index.ts](client/src/components/reports/index.ts)  
- Sales History: [`SalesHistoryPage`](client/src/pages/Sales/Reports/SalesHistoryPage.tsx) ([file](client/src/pages/Sales/Reports/SalesHistoryPage.tsx))  
- Inventory (Admin): [`InventoryPage`](client/src/pages/Admin/Inventory/InventoryPage.tsx) ([file](client/src/pages/Admin/Inventory/InventoryPage.tsx))  
- Sales Inventory (sales role): [`SalesInventoryPage`](client/src/pages/Sales/Inventory/SalesInventoryPage.tsx) ([file](client/src/pages/Sales/Inventory/SalesInventoryPage.tsx))  
- Layouts: [`MainLayout`](client/src/components/layouts/MainLayout.tsx) ([file](client/src/components/layouts/MainLayout.tsx)), [`AuthLayout`](client/src/components/layouts/AuthLayout.tsx) ([file](client/src/components/layouts/AuthLayout.tsx))

Sidebar / UI primitives:
- Sidebar primitives & usage: [client/src/components/ui/sidebar.tsx](client/src/components/ui/sidebar.tsx) · [client/src/components/sidebar/app-sidebar.tsx](client/src/components/sidebar/app-sidebar.tsx)  
- Reusable UI components (card, form, sheet, alert): [client/src/components/ui/*.tsx](client/src/components/ui)

---

## Tech Stack

- Frontend: Vite, React, TypeScript, Tailwind CSS, shadcn/ui components, lucide-react icons, react-router, react-hook-form, zod, zustand
- Backend: Node.js, Express, TypeScript, mongoose
- DB: MongoDB
- Testing / tooling: Jest / React Testing Library (recommended), ESLint (see [client/README.md](client/README.md))

Coding conventions and guidelines are captured in the repo: [.github/copilot-instructions.md](.github/copilot-instructions.md)

---

## Local Development

Prerequisites
- Node.js (>=16)
- MongoDB (local or remote)
- Yarn or npm

1. Clone repo
2. Install dependencies
   - Root (optional): npm install
   - Client: cd client && npm install
   - Server: cd server && npm install

3. Environment
   - Root .env and server/.env exist in repo. Ensure these values are set:
     - MONGO_URI (server/.env)
     - JWT_SECRET, COOKIE settings, and any API_URL/VITE_API_URL overrides
   - The frontend reads API base via [client/src/lib/api.ts](client/src/lib/api.ts) (it switches by import.meta.env.MODE).

4. Start (development)
   - Start MongoDB.
   - Start server: cd server && npm run dev (or npm run start:dev)
   - Start client: cd client && npm run dev
   - Open http://localhost:5173 (or the port printed by Vite)

5. Seed / DB utilities
   - Seed sample data: [server/src/scripts/seed.ts](server/src/scripts/seed.ts) — npm script `npm run seed` (check server/package.json)  
   - Clear DB (preserve admin): [server/src/scripts/clearDB.ts](server/src/scripts/clearDB.ts) — npm script `npm run clearDB`  
   - Sync inventory entries: [server/src/scripts/syncInventory.ts](server/src/scripts/syncInventory.ts) — npm script `npm run sync-inventory`  
   These scripts connect directly to MONGO_URI and are intended for development/maintenance. See [INVENTORY_MANAGEMENT.md](INVENTORY_MANAGEMENT.md) for guidance.

---

## Production

- Build frontend: cd client && npm run build → outputs to `client/dist`  
- Server serves static client files in production mode from `client/dist` (see [server/src/server.ts](server/src/server.ts))  
- Ensure production environment variables are configured (MONGO_URI, NODE_ENV=production, JWT_SECRET, CORS settings)

---

## Authentication & Authorization

- Auth is implemented via JWT stored in cookies. Frontend uses [`useAuthStore`](client/src/store/authStore.ts) to manage auth flow and calls the auth routes at `/api/v0/auth` (see [client/src/lib/api.ts](client/src/lib/api.ts)).  
- Role-based routes use `RoleBasedRoute` in the frontend ([client/src/App.tsx](client/src/App.tsx)) to protect admin vs sales views.

---

## API Overview

- Base: /api/v0 (configurable in [client/src/lib/api.ts](client/src/lib/api.ts) and server routing in [server/src/server.ts](server/src/server.ts))
- Auth: `/api/v0/auth` (routes configured in [server/src/routes/auth.route.js](server/src/routes/auth.route.js) — referenced by [server/src/server.ts](server/src/server.ts))
- Users: `/api/v0/users` ([server/src/routes/user.route.js](server/src/routes/user.route.js))
- Products: `/api/v0/products` ([server/src/routes/product.route.js](server/src/routes/product.route.js))
- Inventory: `/api/v0/inventory` ([server/src/routes/inventory.route.js](server/src/routes/inventory.route.js))
- Purchase Orders: `/api/v0/purchase-orders` ([server/src/routes/purchaseOrder.route.js](server/src/routes/purchaseOrder.route.js))
- Sales Orders: `/api/v0/sales-orders` ([server/src/routes/salesOrder.route.js](server/src/routes/salesOrder.route.js))
- Reports: `/api/v0/reports` ([server/src/routes/report.route.ts](server/src/routes/report.route.ts))

Server endpoints are wired and secured with `verifyToken` middleware where appropriate (see [server/src/routes/report.route.ts](server/src/routes/report.route.ts) for an example).

---

## Folder Structure (high level)

- client/ — React app
  - client/src/App.tsx — app routes & role protection
  - client/src/main.tsx — app bootstrap
  - client/src/lib/api.ts — frontend API client
  - client/src/store/authStore.ts — authentication store
  - client/src/components — UI components and shadcn wrappers
  - client/src/pages — page containers (Admin, Sales)
  - client/vite.config.ts — build config
- server/ — Express API
  - server/src/server.ts — express app and middleware
  - server/src/controllers — controllers (e.g., [report.controller.ts](server/src/controllers/report.controller.ts))
  - server/src/routes — route definitions (e.g., [report.route.ts](server/src/routes/report.route.ts))
  - server/src/models — mongoose models (e.g., [Route.ts](server/src/models/Route.ts))
  - server/src/scripts — utility scripts (seed, clearDB, syncInventory)

---

## Important Implementation Notes

- Frontend environment switching: [client/src/lib/api.ts](client/src/lib/api.ts) uses `import.meta.env.MODE` to select API base URL for development vs production.
- Cookie-based JWT: cookie parser is enhanced in production ([server/src/server.ts](server/src/server.ts)) and CORS is configured with environment variables.
- Inventory: the repo contains scripts and utilities to initialize and sync shop-product inventory entries. See [server/src/scripts/syncInventory.ts](server/src/scripts/syncInventory.ts) and [INVENTORY_MANAGEMENT.md](INVENTORY_MANAGEMENT.md).
- Reports: aggregation logic is implemented in [server/src/controllers/report.controller.ts](server/src/controllers/report.controller.ts) and consumed by frontend reports pages/components ([client/src/pages/Admin/Reports/ReportsPage.tsx](client/src/pages/Admin/Reports/ReportsPage.tsx)).

---

## Developer Guidelines / Best Practices

- Use TypeScript and prefer explicit typing for API payloads and state. API types live in [client/src/lib/api.ts](client/src/lib/api.ts).
- UI: follow shadcn/ui patterns and Tailwind utility-first styling. Reuse existing components in [client/src/components/ui](client/src/components/ui).
- State: use zustand for app-level stores (`useAuthStore` is an example).
- Forms: use react-hook-form + zod for validation (see signup/login forms in [client/src/components/forms/auth/admin](client/src/components/forms/auth/admin)).
- Follow the project conventions documented in [.github/copilot-instructions.md](.github/copilot-instructions.md).

---

## Troubleshooting

- Client cannot reach API: ensure API base URL matches server, check [client/src/lib/api.ts](client/src/lib/api.ts) and server port (default 5000) in [server/src/server.ts](server/src/server.ts).
- Static files not served: verify `client/dist` exists and server is running in production mode. See server static serving in [server/src/server.ts](server/src/server.ts).
- DB issues: check MONGO_URI and use seed/clear/sync scripts in [server/src/scripts](server/src/scripts).

---

## Contributing

- Use feature branches and conventional commit messages (`feat`, `fix`, `chore`, `docs`, `test`, `refactor`).
- Add unit tests for backend controllers and critical frontend logic.
- Follow the code style and component conventions described in [.github/copilot-instructions.md](.github/copilot-instructions.md).

---

## Helpful Files & References

- Root package: [package.json](package.json)  
- Client package: [client/package.json](client/package.json)  
- Server package: [server/package.json](server/package.json)  
- Frontend API helpers & types: [client/src/lib/api.ts](client/src/lib/api.ts)  
- Auth store: [client/src/store/authStore.ts](client/src/store/authStore.ts)  
- Backend server: [server/src/server.ts](server/src/server.ts)  
- DB seed: [server/src/scripts/seed.ts](server/src/scripts/seed.ts)  
- Clear DB: [server/src/scripts/clearDB.ts](server/src/scripts/clearDB.ts)  
- Inventory sync: [server/src/scripts/syncInventory.ts](server/src/scripts/syncInventory.ts)  
- Reports controller: [server/src/controllers/report.controller.ts](server/src/controllers/report.controller.ts)  
- Admin Dashboard page: [client/src/pages/Admin/dashboard/Dashboard.tsx](client/src/pages/Admin/dashboard/Dashboard.tsx)  
- Reports page: [client/src/pages/Admin/Reports/ReportsPage.tsx](client/src/pages/Admin/Reports/ReportsPage.tsx)  
- Sales history page: [client/src/pages/Sales/Reports/SalesHistoryPage.tsx](client/src/pages/Sales/Reports/SalesHistoryPage.tsx)

---