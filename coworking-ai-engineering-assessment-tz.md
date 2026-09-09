# Technical Specification: Two-Day AI-Assisted Engineering Assessment

## 1. Purpose

This is an individual, 48-hour engineering assessment. Its main purpose is to evaluate how effectively a student uses AI to analyze requirements, decompose a complex problem, choose and control tools, review generated code, verify behavior, diagnose failures, and document technical decisions.

The deliverable is a small but complete coworking reservation system. Product scope is intentionally limited, while the required business rules are intentionally non-trivial.

AI use is allowed and expected. The student remains responsible for every submitted line of code and must be able to explain, test, and modify the solution.

## 2. Duration

- Total assessment window: 48 consecutive calendar hours
- Expected active work: no more than 12-16 hours
- Work may be distributed freely within the 48-hour window
- Working through the night is not expected or rewarded
- Submission time is determined by the final Git commit pushed before the deadline

Incomplete work must be identified honestly in the README. A smaller verified solution is better than a larger unverified one.

## 3. Product overview

The system allows members to reserve coworking resources and allows administrators to manage reservations, review financial activity, inspect operational statistics, and view an audit trail.

The system contains two roles:

- **Member:** views resources, creates reservations, and completes simulated payments.
- **Administrator:** manages resources and reservations, views dashboard statistics and charts, and inspects audit logs.

## 4. Fixed technology stack

- Frontend: Nuxt 3, Vue 3, TypeScript, Pinia
- Backend: Node.js, NestJS, TypeScript
- Database: PostgreSQL with Prisma ORM
- Cache and temporary state: Redis
- API: REST with Swagger/OpenAPI
- Authentication: JWT access tokens
- Testing: Vitest or Jest; Playwright is recommended for E2E verification
- Infrastructure: Docker and Docker Compose
- Code quality: ESLint and Prettier

The student may add libraries when justified. Replacing a core technology requires evaluator approval.

## 5. Functional requirements

### 5.1 Authentication and authorization

- Provide login using seeded accounts.
- Provide at least one member account and one administrator account.
- Protect backend endpoints based on role.
- A member must not access administrator endpoints or another member's reservations.
- Authorization must be enforced by the backend; hiding frontend controls is insufficient.
- Registration, password recovery, OAuth, and account verification are outside the scope.

### 5.2 Coworking resource catalog

Each resource contains:

- Name
- Type: desk, meeting room, or private office
- Capacity
- Hourly price
- Operational status

Required behavior:

- Display available resources.
- View basic resource details.
- Allow administrators to create, edit, enable, and disable resources.
- Disabled resources must not accept new reservations.
- Seed at least five resources.

Image upload, maps, advanced filters, and pagination are outside the scope.

### 5.3 Reservations

A member selects a resource and submits a start and end timestamp.

Required reservation statuses:

- `pending`
- `approved`
- `awaiting_payment`
- `confirmed`
- `rejected`
- `cancelled`
- `expired`

The student must define and document valid status transitions.

The backend must enforce the following rules:

1. The start time must be before the end time.
2. The reservation price is calculated from the resource's hourly price.
3. The calculated price is stored with the reservation and must not change when the resource price changes.
4. A disabled resource cannot be reserved.
5. Two active reservations must not overlap for the same resource.
6. Overlap protection must remain correct when concurrent requests are sent.
7. The administrator can approve or reject pending reservations.
8. Rejection requires a reason.
9. An approved reservation becomes `awaiting_payment`.
10. Invalid status transitions must be rejected by the backend.

The student chooses the exact concurrency strategy and must explain its guarantees and limitations.

### 5.4 Redis usage

Redis is mandatory but intentionally minimal.

The implementation must use Redis for both:

1. **Temporary reservation holds:** when a member begins or submits the reservation flow, a short-lived hold is created with a documented TTL. Expired holds must stop blocking availability.
2. **Dashboard caching:** administrator dashboard statistics are cached for a short documented period.

Redis must not be treated as the permanent source of truth. Database constraints or transactional logic must protect confirmed business state.

The student must document:

- Key naming
- TTL values
- Cache invalidation or expiration strategy
- Behavior when Redis is unavailable
- Why Redis alone is insufficient for preventing permanent overlapping reservations

### 5.5 Simulated payments

No real payment provider is required. Implement a deterministic mock payment provider.

Required behavior:

- Create a payment request only for a reservation in `awaiting_payment`.
- Simulate successful and failed payment events.
- Accept a simulated payment webhook.
- Authenticate the webhook with a local signing secret.
- Process provider event identifiers idempotently.
- A duplicated webhook must not create duplicate payments, ledger entries, or reservation transitions.
- A successful payment confirms the reservation.
- Store the raw provider event identifier and processing status.

### 5.6 Financial ledger

For every successful payment, create append-only ledger entries for:

- Member charge
- Platform commission
- Owner payable amount

Use a fixed platform commission of 10%.

Required financial rules:

- Money must not be calculated using binary floating-point values.
- Define and document currency, rounding, and smallest-unit rules.
- Ledger records must not be silently edited or deleted.
- Duplicate webhook processing must not duplicate ledger entries.
- Total charge must equal platform commission plus owner payable amount.

Refunds and real owner payouts are outside the mandatory scope.

### 5.7 Minimal administrator panel

The administrator panel must contain:

1. Login
2. Dashboard
3. Resource management
4. Reservation management
5. Payment and ledger view
6. Audit-log view

The panel may use a simple design, but it must include loading, empty, validation, success, and failure states.

#### Reservation management

- List reservations.
- Filter by status.
- Open reservation details.
- Approve or reject a pending reservation.
- Display reservation status history.

#### Payment and ledger view

- List payment attempts and statuses.
- Open payment details.
- Display ledger entries connected to a successful payment.

### 5.8 Dashboard and charts

The administrator dashboard must display at least four summary values:

- Total resources
- Total reservations
- Confirmed reservations
- Total successful payment amount

It must include at least two charts:

1. Reservations grouped by status
2. Successful payment totals grouped by day

Requirements:

- Chart values must come from backend endpoints.
- The date range must be visible and documented.
- Empty datasets must render correctly.
- Dashboard data must use the Redis cache defined in Section 5.4.
- After a relevant mutation, the cache must be invalidated or allowed to expire according to the documented strategy.

Visual sophistication is not a primary scoring criterion. Correct data and clear presentation matter.

### 5.9 Audit logs

Audit logs are mandatory.

Record at least:

- Administrator resource creation and updates
- Resource enable/disable actions
- Reservation approval and rejection
- Successful payment webhook processing
- Rejected invalid status-transition attempts

Each audit record must contain:

- Actor identifier or `system`
- Action
- Target type
- Target identifier
- Timestamp
- Relevant metadata
- Before and after values where applicable

Audit logs must not contain passwords, access tokens, signing secrets, or other credentials.

The administrator can list audit entries and filter them by action or target type. Audit entries must be append-only through the application.

## 6. Required API and data properties

- Publish Swagger documentation.
- Validate all incoming data on the backend.
- Store timestamps in UTC.
- Use explicit database migrations.
- Provide deterministic seed data and demo accounts.
- Return consistent API errors.
- Do not expose password hashes or secrets.
- Add database constraints and indexes required by the business rules.
- Use database transactions for multi-step payment and ledger operations.
- Provide a health endpoint covering the application, PostgreSQL, and Redis.

## 7. Required tests

The automated test suite must prove at least:

1. A member cannot access administrator endpoints.
2. A member cannot access another member's reservation.
3. Invalid reservation intervals are rejected.
4. Invalid reservation status transitions are rejected.
5. Concurrent overlapping reservation attempts cannot both succeed.
6. A disabled resource cannot be reserved.
7. A duplicate successful-payment webhook produces only one payment effect.
8. Ledger distribution equals the total successful charge.
9. Relevant administrative actions create audit records.
10. Dashboard aggregation returns correct values for seeded test data.

The student must explain what risk each important test protects against. Tests containing meaningless assertions do not count.

## 8. AI-assisted engineering requirements

### 8.1 Allowed tools

The student may use any AI coding assistant, language model, CLI agent, IDE integration, MCP server, custom skill, reusable prompt, documentation-search tool, database tool, or browser-testing tool.

Using more tools does not automatically earn more points. Tool choice, context quality, control, verification, and results are evaluated.

### 8.2 Required repository evidence

The repository must contain:

```text
AGENTS.md
docs/
  implementation-plan.md
  architecture.md
  ai-workflow.md
  known-limitations.md
  decisions/
    0001-reservation-concurrency.md
    0002-payment-idempotency.md
    0003-redis-strategy.md
.ai/
  evaluation-log.md
README.md
```

Equivalent organization is acceptable if all evidence is easy to locate.

### 8.3 `AGENTS.md`

The file must instruct AI agents about:

- Project architecture and boundaries
- Coding conventions
- Commands for validation
- Files or behavior that must not be changed without review
- Security constraints
- Definition of done

Generic copied instructions without project-specific value receive little credit.

### 8.4 Implementation plan

Before substantial implementation, document:

- Requirement interpretation
- Assumptions and open questions
- Task decomposition
- Dependencies
- Highest technical risks
- Planned verification
- What will be excluded if time becomes insufficient

The plan may change, but important changes must be explained.

### 8.5 AI workflow document

Document:

- AI tools, agents, models, skills, and integrations used
- Why each important tool was chosen
- How context was selected and limited
- How tasks were kept small and verifiable
- How generated diffs were reviewed
- How unrelated changes were prevented
- How secrets were protected
- How browser, API, tests, logs, or database queries were used for verification

### 8.6 Curated evaluation log

Do not submit every prompt. Record important evidence only:

- At least three important AI-assisted tasks
- At least one incorrect or incomplete AI response
- How the problem was detected
- How the instruction or implementation was corrected
- At least one AI suggestion that the student rejected, with reasoning
- At least one reusable prompt, instruction, skill, command, or automation created or improved

Links to relevant commits are encouraged.

## 9. Git and submission requirements

- Use Git from the beginning.
- Commit understandable units of work.
- A single final generated commit is unacceptable.
- Commit messages must describe the purpose of changes.
- Provide `.env.example` without real secrets.
- The complete system must start through documented Docker Compose commands.
- The final submission must include migrations, seeds, tests, Swagger, AI workflow evidence, and known limitations.
- The default branch must contain the submitted version before the deadline.

## 10. Recommended work sequence

This sequence is guidance, not a required hourly reporting schedule.

| Active time | Suggested focus                                                                             |
| ----------- | ------------------------------------------------------------------------------------------- |
| Hours 0-2   | Requirements, assumptions, architecture, risk analysis, AI workflow and implementation plan |
| Hours 2-5   | Project setup, authentication, schema, seed data and resource management                    |
| Hours 5-9   | Reservation workflow, Redis holds and concurrency protection                                |
| Hours 9-12  | Mock payments, idempotency, ledger and audit logs                                           |
| Hours 12-14 | Admin dashboard, charts and Redis caching                                                   |
| Hours 14-16 | Tests, verification, documentation and final cleanup                                        |

The student is not penalized for using a different sequence if it is justified.

## 11. Evaluation rubric

| Category                            | Weight | Main evidence                                                               |
| ----------------------------------- | -----: | --------------------------------------------------------------------------- |
| AI workflow and context engineering |    25% | Instructions, tool selection, task boundaries, AI evaluation log            |
| Complex-problem correctness         |    25% | Concurrency, Redis behavior, idempotency, ledger integrity, audit integrity |
| Testing and verification            |    20% | Automated tests, targeted checks, review evidence, reproducibility          |
| Planning and decomposition          |    15% | Initial plan, assumptions, risk management, prioritization                  |
| Architecture and code quality       |    10% | Boundaries, migrations, security, clarity, maintainability                  |
| Product demonstration and usability |     5% | Working vertical flow, admin panel, dashboard and clear states              |

### Evaluation cautions

- Tool, model, prompt, or token count does not earn points by itself.
- A polished interface does not compensate for incorrect business rules.
- High test coverage does not compensate for meaningless tests.
- Complexity without demonstrated need may reduce the architecture score.
- Functionality the student cannot explain or modify is not considered fully owned.
- Honest documented incompleteness receives more consideration than falsely claimed completion.

## 12. Final review and live task

After submission, the student presents:

1. A short product demonstration.
2. The reservation concurrency strategy.
3. Payment-webhook idempotency and ledger guarantees.
4. Redis key, TTL, failure, and cache strategy.
5. Audit-log design.
6. The AI workflow, including one failure and correction.

The evaluator may then provide a 45-60 minute unseen task. AI tools remain allowed. Possible tasks include:

- Fix an owner/member authorization leak.
- Diagnose duplicate ledger entries.
- Change the commission percentage without corrupting existing payments.
- Add reservation cancellation while preserving audit history.
- Correct stale dashboard data caused by cache invalidation.

The live task evaluates investigation, AI context preparation, scope control, diff review, verification, and explanation.

## 13. Automatic rejection or reassessment conditions

- The student cannot explain central submitted code.
- The project cannot start using the documented process.
- Backend authorization is missing.
- Secrets are committed.
- Overlapping active reservations can be created through concurrent requests.
- Duplicate successful webhooks create duplicate financial effects.
- Financial or audit records can be silently changed or deleted through application behavior.
- The repository is substantially copied without disclosure.
- AI workflow evidence is fabricated.
- Tests are disabled or intentionally misleading.

## 14. Explicitly excluded scope

- Registration, password recovery, OAuth, and SMS verification
- Real payment integration
- Refunds and real payouts
- Email and SMS delivery
- File uploads and image management
- Facility tickets
- Maps and advanced catalog search
- Localization
- Queues and scheduled background jobs
- WebSockets
- Production Kubernetes or cloud infrastructure

Students must prioritize mandatory correctness before adding anything outside the required scope.

## 15. Definition of done

The submission is complete when:

- The required member flow works from resource selection to confirmed payment.
- The required administrator workflows, dashboard, charts, and audit-log view work.
- Redis is used for temporary holds and dashboard caching.
- Concurrency, payment idempotency, ledger, authorization, and audit requirements are enforced.
- Required automated tests pass.
- Docker-based setup works from a clean environment.
- Documentation matches actual behavior.
- AI workflow evidence is complete and honest.
- Known limitations are clearly documented.
- The student can explain and modify the solution during review.

---

This specification intentionally compresses the product into one difficult vertical slice. The short deadline does not reduce the required engineering discipline; it makes prioritization, AI orchestration, verification, and honest scope control central parts of the assessment.
