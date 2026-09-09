# Frontend Agent Instructions and Constraints (AGENTS.md)

This file contains strict boundaries, architectural guidelines, and UI/UX rules for AI agents generating the Nuxt 3 frontend application.

## 1. Role and Boundaries
- You are a Senior Vue 3 and Nuxt 3 Frontend Engineer.
- You must write type-safe, maintainable, production-ready TypeScript code.
- Do NOT alter backend API contracts, database migrations, or server-side business rules.
- Do NOT install complex, heavy component frameworks or unnecessary UI libraries without permission. Keep dependencies minimal.

## 2. Fixed Frontend Stack
- **Framework:** Nuxt 3 (Composition API, `<script setup lang="ts">`)
- **State Management:** Pinia stores
- **Styling:** Tailwind CSS (or minimal standard CSS)
- **Icons & UI:** Lightweight icons (e.g., Lucide Vue or Heroicons)
- **API Client:** Nuxt `$fetch` / `useFetch` wrapper with typed API responses

## 3. Core UI & UX Requirements

### State Handling (Mandatory for every view)
Every page and data-fetching component must explicitly handle and display all 5 states:
1. **Loading state:** Skeleton loaders or clear loading spinners.
2. **Empty state:** Meaningful messaging and illustration/icon when lists or datasets are empty.
3. **Validation state:** Inline form error messages on bad inputs (e.g., end time before start time).
4. **Success state:** Feedback toasts/alerts on successful reservation or admin action.
5. **Failure/Error state:** Informative, user-friendly error banners when API requests fail.

### Role-Based Views & Navigation
- Provide separate flows for **Member** and **Administrator** roles.
- Protect admin views using Nuxt route middleware (check token and user role in Pinia store).
- Note: UI-level hiding is strictly cosmetic; understand that all authorization is backed by the server.

### Specific Screens to Implement
1. **Login:** Simple seeded credentials selector or clean form.
2. **Member Booking Flow:**
   - Resource catalog with operational status (Active / Disabled).
   - Resource details and booking drawer/form (start/end UTC timestamps).
   - Real-time total price preview (Hourly price × duration).
   - Simulated payment modal for reservations in `awaiting_payment` status.
3. **Administrator Panel:**
   - **Dashboard:** 4 metric cards (Total resources, total reservations, confirmed reservations, revenue) and 2 charts (Reservations by status, payments by day).
   - **Resource Management:** Table with status toggle (enable/disable), create, and edit modals.
   - **Reservation Management:** Table with status filters, rejection modal (reason input mandatory), and approval action.
   - **Ledger & Audit View:** Filterable tables showing financial ledger records and immutable audit logs.

## 4. Coding Conventions & Quality
- Strict TypeScript: Avoid `any`. Define clear interfaces for all API payloads and entities.
- Store logic: Keep API mutation calls, auth state, and active reservations inside Pinia stores.
- Dates & Time: Always work with ISO 8601 UTC strings when communicating with the backend. Display local, human-readable time to the user.
- Currency: Format integer cents/smallest units properly (e.g., display `$15.00` instead of raw units).

## 5. Verification Commands
Before submitting or finalizing frontend code:
- **Lint Check:** `npm run lint`
- **Type Check:** `npx nuxi typecheck`
- **Build Verification:** `npm run build`