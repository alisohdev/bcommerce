# Implementation and release gates

The orchestrator authorized the M0b foundation on 2026-10-26 after approving M0a at fd05aea9c3dd74e44990573074b89808196e0d0e. Foundation implementation is authorized. Its acceptance still requires executed evidence. M0c and commerce implementation are not authorized.

## M0a documentation exit

M0a established the [accepted baseline](decision-register.md), 12 proposed ADRs, historical aliases, open decisions, and commerce gates. Its [documentation validation](documentation-validation.md) remains a historical report. The sign-off corrections record the GitHub baseline, Conversation/ADR-003 alias of LOCK-04, and the stage separation below.

## M0b scope after separate authorization

M0b builds only a Bun workspace, reproducible pins, strict configurations and negative fixtures, Elysia health skeleton, TypeBox contract fixtures, OpenAPI export, thin generated client proof, PostgreSQL connection, Drizzle migration harness, Docker development environment, and GitHub Actions checks.

No real catalog, pricing, cart, checkout, inventory, payment, or order behavior is allowed. Better Auth isolation and an independent Astro consumer belong to M0c. Minimal isolated TSX or format fixtures may validate the foundation without creating a dashboard or storefront.

| Check | M0b acceptance criterion |
| --- | --- |
| Toolchain | Clean installation uses exact versions and immutable artifact identities. Native Bun lint remains official. No floating lint canary. |
| Negative fixtures | Seeded floating and misused promises, forbidden module imports, strict type errors, and a minimal invalid React-hook fixture fail the intended checks. A clean control passes. |
| Formatting | Bad foundational TS/TSX formatting fails without writing. Formatting twice produces no second change. |
| Elysia and TypeBox | Live/ready endpoints work. Invalid request bodies and response fixtures fail actual validation. Readiness fails when PostgreSQL or schema prerequisites are unavailable. |
| OpenAPI and client | Deterministic non-commerce contract covers unions, errors, nullable and optional fields, cookies, and money-shaped strings. Generated client type-checks and performs real fixture requests without engine source imports. |
| Migrations | Fresh setup and repeat converge. Two migrators cannot apply work twice. Connection loss and transactional failure permit safe retry with a valid journal. Exact Drizzle behavior is tested. |
| Development and CI | Docker development services and GitHub Actions execute the same pinned foundation commands. Evidence distinguishes executed local/container checks from remote CI results. |

TECH-01 through TECH-03 track foundation evidence. TECH-04 is an M0c storefront integration gate. Exact tooling gaps cannot be resolved by substituting locked technologies without orchestrator approval.

## M0c integration proofs

M0c requires separate authorization. It retains these criteria from the original M0b table, with their scope clarified rather than deleted.

| Original criterion | Integration evidence retained for M0c |
| --- | --- |
| Type coverage | Seeded backend, dashboard, worker, and Astro errors fail their respective checks once those sources exist. No source category is silently omitted. |
| Formatting | Bad Astro formatting fails without writing. Astro-specific formatting is idempotent. |
| Contract compatibility | A deliberate incompatible contract change fails. A compatible addition passes the retained client baseline. Extend the M0b client proof to independent consumers. |
| Rollback | Old image operates on a fixture expansion after new-image writes. New-image readiness rejects missing prerequisites. |
| Identity experiment | Customer credentials cannot establish staff authority. Forged role input fails. Disabled methods stay disabled. Staff provisioning is controlled. |
| Bun deployment | Elysia and the intended independent Astro mode work with pinned Bun. Persistence survives restart. Any runtime exception needs a demonstrated blocker and explicit approval. |
| Initial recovery integration | An isolated database/media restoration verifies data. Injected database and worker failures reach the intended alerts when those components exist. |

M0c does not itself authorize commerce modules or production. The payment, checkout, and inventory gates below remain independent.

## Pre-production hardening

Before a live client, complete measured restore/recovery drills against approved RPO and RTO, monitor backup freshness, verify real alert delivery, and test production-shaped data and failure cases. The original restore-and-alert criteria are preserved here as release obligations, beyond M0c's isolated integration proof.

Run extended compatibility against every supported deployed consumer and rollback combination, including worker payloads, new writes, and permitted partial migrations. An exceptional nontransactional migration requires its own recovery test before first use.

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
