# Frontend Implementation Plan

## Scope and interpretation

This Nuxt 3 frontend implements the assessment's member reservation flow and administrator operational views. It consumes the documented REST API only; it does not implement database constraints, Redis operations, payment webhooks, or authorization enforcement. Those remain backend responsibilities.

## Assumptions

- The API base URL is configured with `NUXT_PUBLIC_API_BASE_URL` and returns JWT-backed JSON responses.
- Monetary API fields are integer USD cents. The UI formats cents and uses integer-only arithmetic for price previews and commission splits.
- Local datetime controls are converted with `Date#toISOString()` immediately before an API payload is created.
- Reservation holds are created and expired by the API. The UI displays the five-minute hold window supplied by the product rule.

## Delivery sequence

1. Establish strict TypeScript, Pinia, Tailwind, runtime configuration, and architecture documentation.
2. Add persisted authentication state, global role-aware navigation guard, and seeded demo-account login form.
3. Build the member resource catalog with explicit loading, empty, validation, success, and failure presentation.
4. Add a validated reservation drawer with UTC conversion, integer-cent estimate, and hold countdown.
5. Add the idempotent-in-the-UI simulated payment modal and a clear commission breakdown.
6. Add administrator dashboard, reservation controls, resource management, and read-only financial/audit views; refresh dashboard data after mutations.
7. Record AI workflow evidence, document limitations, and run lint, typecheck, and production build.

## Dependencies and technical risks

- API response shapes and endpoint availability are the largest integration dependency; stores centralize these contracts.
- The browser cannot guarantee reservation concurrency or payment idempotency. The UI will surface backend conflicts and prevent duplicate local submissions, while server-side transactions remain authoritative.
- Datetime input values have no timezone. Conversion is deliberately performed only at submit time, so the user sees local time and the API receives UTC.
- Decimal money calculations are prohibited. Durations use whole billable hours and all totals are represented as `number` integer cents.

## Planned verification

- Run `npm run lint`, `npx nuxi typecheck`, and `npm run build` after implementation.
- Manually review network payload construction for ISO-8601 UTC timestamps and integer monetary fields.
- Exercise loading, empty, invalid-form, mutation-success, and failed-request branches with API fixtures or unavailable endpoints.

## Time-boxed exclusions

No real payment provider, WebSockets, advanced catalog search, upload handling, localization, or arbitrary dashboard date picker is planned. Backend security, Redis availability behavior, database overlap protection, and webhook signature validation are documented but deliberately not replicated in client code.
