# Implementation and release gates

Status: PROPOSED acceptance criteria. The accepted authorization boundary is M0a documentation only. M0b has not been authorized. No application tests listed below have run.

## M0a documentation exit

M0a establishes the [accepted baseline](decision-register.md), 12 proposed ADRs, historical aliases, open decisions, and separate commerce gates. Validate local links, unique identifiers, status agreement, and documentation-only changes. Record the checks in [documentation validation](documentation-validation.md).

Stop for orchestrator review. Completion of documentation does not authorize M0b or close any commerce gate.

## M0b scope after separate authorization

M0b may establish the skeleton, toolchain, non-commerce contract fixtures, database migration fixtures, health endpoints, and deployment validation. It must not implement cart, checkout, payments, or inventory business logic. Any identity experiment remains isolated and subject to BC-ADR-005.

| Check | Measurable acceptance criterion |
| --- | --- |
| Toolchain | Clean CI uses exact versions and immutable artifact identities. No floating lint canary. |
| Lint effectiveness | Seeded floating and misused promises, forbidden module imports, and incorrect React hooks fail the intended jobs. |
| Type coverage | Seeded backend, dashboard, worker, and Astro errors fail their respective checks. No source category is silently omitted. |
| Formatting | Bad TSX and Astro formatting fails without writing. Formatting twice produces no second change. |
| OpenAPI | Non-commerce fixtures cover unions, errors, nullable and optional fields, cookies, and money-shaped strings. Generated client requests and type checks pass. |
| Contract compatibility | A deliberate incompatible contract change fails. A compatible addition passes the retained client baseline. |
| Migrations | Fresh setup and repeat converge. Two competing migrators cannot apply work twice. Connection loss and transactional failure permit safe retry with a valid journal. |
| Rollback | Old image operates on a fixture expansion after new-image writes. New-image readiness rejects missing prerequisites. |
| Identity experiment | Customer credentials cannot establish staff authority. Forged role input fails. Disabled methods stay disabled. Staff provisioning is controlled. |
| Bun deployment | Elysia and the intended Astro mode work with pinned Bun. Persistence survives restart. Any exception has a demonstrated blocker. |
| Restore and alerts | An isolated database/media restoration verifies data and measures recovery. Injected database and worker failures reach the intended alerts. |

TECH-01 through TECH-04 in [open decisions](open-decisions.md#technical-and-environment-blockers) are M0b acceptance blockers, not permission to change locked technologies. An exceptional nontransactional migration needs its own recovery test before first use.

## Separate commerce implementation gates

| Gate | Required before implementation | Required before release |
| --- | --- | --- |
| Payment | Explicit acceptance of relevant portions of BC-ADR-001, BC-ADR-002, BC-ADR-004, and identity rules. Close OPEN-01 for each selected gateway. | Forged, duplicate, delayed, absent, and reordered callbacks. Provider success followed by timeout or crash. Unknown creation result. Already-verified recovery. Two successful attempts retained with one fulfillment and one compensation obligation. |
| Inventory | Accept BC-ADR-003 and stock adjustment, duration, extension, and lock-order policies. Close OPEN-03 for the supported flow. | On real PostgreSQL, 100 concurrent reservations for stock of one, across 1,000 runs, yield exactly one winner per run. Multi-line failure leaves no hold. Expiry, release, and consumption races preserve counters and act once. |
| Checkout | Accept pricing, payment, reservation, ownership, idempotency, and late-payment contracts. Close applicable OPEN-02, OPEN-03, and OPEN-04 decisions. | Stale quote handling, immutable snapshots, allocation, unauthorized access denial, retry convergence, and late paid orders without stock. Same idempotency key and payload returns the original result. Changed payload conflicts. |

Financial evidence and compensation obligations must survive every failure case. A uniqueness constraint must not discard evidence of a second payment.

## Shared release checks

Outbox tests inject failure before and after claim commit, before provider request, after provider success, before acknowledgement, at lease expiry, and at stale completion. Assert the documented external guarantee for each effect. Do not substitute local row deduplication for provider idempotency.

Money tests include non-multiples of ten IRR, rounding ties, discount residues, partial refunds, bounds, provider minimums and maximums, and factor-of-ten conversion errors. OTP tests use rotating IPs and concurrent sends to prove per-phone and global budgets.

Before a live client, run the proposed 24-hour representative soak. Observe memory trends, pool recovery, backlog, and performance against an approved workload. This duration is a proposed validation task, not a measurement or evidence of a current defect.
