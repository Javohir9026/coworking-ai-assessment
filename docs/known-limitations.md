# Frontend Known Limitations

- **No WebSocket Live Updates:** Admin dashboard metrics and reservation status histories rely on manual page reloads or mutation-triggered refetches rather than real-time WebSocket subscriptions.
- **Dashboard filtering:** Dashboard requests currently show all recorded data. Date-range controls are the next backend/frontend integration increment.
- **No Optimistic Payment UI:** The simulated payment flow waits for explicit webhook/backend settlement confirmation before mutating the local booking state to `confirmed`.
- **Backend required for guarantees:** JWT verification, RBAC, reservation overlap prevention, Redis hold/cache behavior, webhook idempotency, and append-only ledger/audit integrity cannot be guaranteed by a browser client.
- **Billable duration assumption:** The UI estimates whole-hour reservations using integer milliseconds. The API's stored price is authoritative should its rounding policy differ.
- **Verification scope:** The frontend has a Playwright member-login smoke test. API integration, Redis failure recovery, and concurrency/payment guarantees still require the companion backend integration suite.
