# Frontend Architecture & State Management (Nuxt 3)

## 0. Frontend boundary

The Nuxt application is a typed REST client. Pinia stores own request lifecycle and mutation state; pages and components render it. `services/api-client.ts` adds the JWT bearer token and normalizes failed API responses. No client-side rule is relied on for authorization, concurrency, ledger integrity, cache invalidation, or payment idempotency.

## 1. Role-Based Navigation & Security Boundary

- **Middleware:** `auth.global.ts` checks token existence and user role decoded from JWT claims.
- **Client-Side Boundary:** Unauthenticated users are redirected to `/login`. Members attempting to access `/admin/*` are bounced to `/reservations`.
- **Architectural Honesty:** Route middleware and conditional UI rendering (`v-if="isAdmin"`) are strictly for user experience. True enforcement is delegated entirely to backend guards.

## 2. Universal State Presentation Pattern

Every UI module adheres strictly to the 5 mandatory UX states:

- **Loading:** Rendered using lightweight skeleton cards to avoid layout shift.
- **Empty:** Rendered when API returns empty arrays (e.g., zero bookings found for a date range).
- **Validation:** Form-level constraints (e.g., preventing reservation submission if `endDate <= startDate`).
- **Success:** Non-blocking toast/banner confirmations on resource creation or booking completion.
- **Failure:** Typed error alerts capturing backend RFC-7807/standard error responses.

## 3. Data Representation

- **Timestamps:** Input forms capture local datetime, converted to ISO-8601 UTC strings before payload dispatch.
- **Currency:** Amounts are integer UZS minor units (so no fractional conversion is applied) and are displayed with the shared `formatUzs` formatter. Price calculations remain integer-only.

## 4. Redis contract visible to the frontend

The API owns `hold:{resourceId}:{holdId}` keys with a ten-minute TTL and `dashboard:{kind}:{range}` keys with a short TTL. A successful reservation, payment, or admin mutation invalidates dashboard data server-side; the client immediately refetches its dashboard query as well. Redis being unavailable must degrade to uncached backend reads or a clear API failure, never client-side persistence. Redis holds are advisory preflight locks only; database transactions and the PostgreSQL exclusion constraint protect permanent overlap correctness.
