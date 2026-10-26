# Better Commerce: Independent Architecture Review 001

**Review basis.** I received only the brief. No ADRs, repository, code, or prior review notes were provided, so nothing about implementation is verified. Where I say "the design does X", I mean the design as described in the brief. Tool claims were checked against current official docs on 2026-10-26.

| Category | Contents |
|---|---|
| Approved | The stack table (Bun, Elysia, TypeBox, Better Auth, Drizzle, Postgres, Astro, React+Vite) |
| Provisional | SDK form, package boundaries, repo layout, release mechanism, extension points |
| Missing | All commerce invariants, state machines, ADRs |
| Needs benchmarks | Elysia OpenAPI output quality, Eden type-check cost, Bun soak behaviour under payment load |

---

## A. Executive verdict

**APPROVE WITH REQUIRED CHANGES.**

The stack is defensible. Per-client deployments, a modular monolith, and "no theme engine, no multi-tenancy" are the right size for a solo developer. I would not restart framework selection.

The brief leaves the commerce core undefined: payment commit, inventory reservation, and money. That is where this kind of system fails. M0 (skeleton, toolchain, migration harness) can start. **No cart, checkout, payment or inventory code should be written until ADR-001 to ADR-005 below are accepted.** That is why P0-1 and P0-2 are scoped to the checkout module and do not block M0.

Two of your accepted-stack assumptions need correcting:

- **Toolchain.** `bun check`, `bun fmt` and `bun lint` do exist, but they are weeks old and one is canary-only (P1-1).
- **Payment model.** The brief talks about forged payment *notifications*. Iranian gateways generally don't send signed notifications (P0-1).

---

## B. Findings by severity

### P0: blocks the checkout module (not M0)

**P0-1. The payment commit model is undefined, and the brief assumes the wrong gateway shape.**
- *Evidence:* A Zarinpal-style flow redirects the browser to your callback URL with `Authority` and `Status` query parameters. The merchant then calls a verify endpoint to confirm the payment. An authority also becomes invalid after roughly two hours. The verify API also has an "already verified" outcome, so verification is idempotent at the gateway. There is no signed server-to-server webhook to trust. The callback is attacker-controllable input, and the only source of truth is your server asking the gateway. Verify this per gateway before writing the adapter interface.
- *Impact:* Without an explicit design, you get double-captured orders, orders marked paid from a forged `Status=OK`, and paid-but-unfulfillable orders with no recovery path.
- *Correction:*
  - A `payment_attempts` table with a unique gateway reference and a frozen IRR amount.
  - The callback handler only *enqueues a reconcile* for that attempt. It never transitions state itself.
  - `captured` is reachable only via a successful gateway verify, using the stored amount, never one from the request.
  - Persist "verify requested" *before* calling the gateway, so crash recovery knows to call inquiry.
  - Call the gateway outside any DB transaction.
  - A sweeper reconciles attempts stuck in `redirected` or `verifying`.
  - The adapter interface stays at four methods: `start`, `verify`, `inquiry`, `reverse`.
- *Cost:* Medium. This is the heart of the system.

**P0-2. The inventory and reservation strategy is unspecified.**
- *Impact:* "Check stock, then decrement" in application code oversells under concurrency.
- *Correction:*
  - Reserve with a single conditional `UPDATE ... WHERE on_hand - reserved >= :qty RETURNING`.
  - Keep reservation rows with `expires_at` and a unique `(checkout_id, sku)`.
  - Add `CHECK (reserved <= on_hand)` as a backstop.
  - Acquire multi-line carts in a fixed SKU order to avoid deadlocks.
  - Never cache stock for decisions.
  - READ COMMITTED is sufficient with the conditional update.
  - Convert reservation to sale on capture.
- *Cost:* Low to medium.

### P1: resolve before implementing the affected area

**P1-1. Toolchain maturity is overstated.**
- *Evidence:*
  - `bun check` first shipped in Bun 1.4.3, released October 10, 2026.
  - `bun fmt` arrived in Bun 1.4.4.
  - The `bun lint` docs say it is only available in canary builds.
  - `bun check` only type-checks and writes no `.tsbuildinfo`.
  - Both `bun lint` and `bun fmt` run a package.json `lint`/`fmt` script if one exists, so a script named `lint` that calls `bun lint` is subtle and needs care.
- *Impact:* The only gates in front of payment code would be a two-week-old checker, a days-old formatter, and a linter that isn't in the stable channel.
- *Correction:*
  - Pin Bun exactly (in `.bun-version` and by Docker image digest).
  - For three months, run `bun check` and `tsc` (TypeScript 7) side by side in CI.
  - Use a pinned `oxlint` for CI gating until `bun lint` reaches stable. It reads the same configs, so switching later is cheap.
  - `bun fmt` is low-risk because it reads Prettier config.
- *Cost:* Low.

**P1-2. Tooling coverage gaps for Astro and React.**
- *Evidence:*
  - `bun fmt` doesn't have Astro built in and hands those files to Prettier with the Astro plugin if one is configured.
  - `bun lint` covers JS/TS/JSX/TSX files only. `.astro` files go unlinted.
  - `bun check` doesn't understand `.astro` either.
- *Correction:*
  - Per storefront: `astro check` (`@astrojs/check`) plus Prettier with `prettier-plugin-astro`. That is the one justified extra tool, because native Bun can't do it.
  - Backend/admin: `tsconfig` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`.
  - Type-aware rules `no-floating-promises` and `no-misused-promises` as errors. `bun lint --type-aware` supports the floating-promise rule.
  - A `no-restricted-imports` rule for module boundaries (below).
  - `bun audit` and an OpenAPI breaking-change diff (`oasdiff`) in CI.
  - Security-sensitive test suites as a named CI job: authorization/IDOR, payment state machine, reservation concurrency.
- *Cost:* Low.

**P1-3. Don't use Eden Treaty for storefronts. Use a thin generated client, not an "SDK product".**
- *Reasoning:* Eden types come from importing the server's `App` type. That ties every storefront's compile to the engine's source and TypeScript version. It breaks the independently deployed, version-skewed model you need, and it requires strict method-chaining discipline on the server. It's excellent for the admin app, which ships in the same monorepo and release as the API.
- *Evidence:* Elysia ships an OpenAPI plugin, and it supports Standard Schema validators alongside TypeBox. The route to a spec exists. **Hypothesis requiring a spike:** that Elysia's emitted spec is complete for unions, error responses, and bodies, and that a generator produces type-correct clients from it.
- *Correction:*
  - One artifact, `openapi.json`, attached to every engine release.
  - Each storefront repo generates types from it (`openapi-typescript` plus a ~150-line hand-written fetch core).
  - The core handles the error envelope, cookie forwarding for SSR, and an `Idempotency-Key` helper.
  - No registry-published SDK package for three clients.
  - No multiple SDKs.
- *Cost:* Low. Cheaper than the current proposal.

**P1-4. Authentication boundaries.**
- **Separate admin and customer identities.** Use two Better Auth instances, with separate tables, cookie prefixes, and base paths. Admin is invite-only, has no public sign-up, and requires a second factor. A customer-side bug then cannot mint an admin session. The cheaper alternative is a single instance with a non-user-settable `role`, which I'd accept only with a test proving sign-up input cannot set it.
- **Make the topology same-origin.** Put Caddy or nginx in front, so `/` goes to Astro, `/api` to Elysia, and `/admin` to the SPA.
  - Better Auth's defaults (SameSite=Lax plus Fetch Metadata checks) protect against CSRF.
  - Cross-domain setups need `SameSite=None` and carry a documented CSRF risk, mitigated by trustedOrigins.
  - Same-origin makes cookies first-party, removes CORS, and keeps the safe defaults.
- **Guest checkout is not authentication.** Use an opaque cart token in an httpOnly cookie, stored hashed. Order lookup for guests requires a phone-verified token. Cart merge on login is a server-side transaction with deterministic rules that carries reservations over.
- **Better Auth owns:** credentials, sessions, OTP issuance and verification, password reset.
- **Better Commerce must enforce:** order, cart and address ownership on every read (IDOR), admin permissions, business-endpoint rate limits, SMS budgets, and the merge policy.
- *Cost:* Low to medium.

**P1-5. SMS OTP cost and abuse controls.**
- *Evidence:* Better Auth's default rate limit is per IP and path, and it can use database or secondary storage. Each OTP code allows 3 verification attempts by default.
- *Impact:* Rotating IPs makes per-IP limits meaningless, and each send costs real money.
- *Correction:*
  - Per-phone cooldown and a daily cap.
  - A global daily SMS budget, with an alert and automatic pause.
  - Accept only valid Iranian mobile formats.
  - Database-backed limiter storage, so a restart doesn't reset it.
  - A self-hosted proof-of-work challenge. Third-party captcha reachability from Iran is unverified.
  - Do not await the send callback, to avoid timing-based account enumeration.
  - Define a recovery policy for phone-only accounts, since number recycling and SIM swaps happen.
- *Cost:* Low.

**P1-6. Money representation and units.**
- *Correction:*
  - Store IRR as an integer (`bigint`). Toman is display only and never stored.
  - Use a branded `Rial` type.
  - Prices must be multiples of 10 rial, so toman display is exact.
  - Pick one discount rounding rule and apply it once per line.
  - Gateway adapters do an explicit unit conversion, with a test that catches the classic ×10 error.
  - Freeze the payable amount when a payment attempt starts.
  - If prices change before redirect, return `409 PRICE_CHANGED` with new totals.
  - Snapshot unit price, discounts, and tax on the order lines.
  - Keep API amounts as integers within the safe-integer range, asserted at the boundary.
- *Cost:* Low.

**P1-7. Migrations and version skew across independent installs.**
- *Evidence:*
  - Drizzle v1 removed the first-generation relational queries API, rewrote the kit, and changed the migrator to apply all missing migrations.
  - It also changed the migration folder format, with a new `drizzle-kit up` step.
  - My sources conflict on whether 1.0 is the `latest` tag. One third-party profile said stable v1.0 was still pending as of early 2026. Check npm directly.
- *Correction:*
  - Choose Drizzle's relational queries v2 from day one, and pin the exact version.
  - Use expand/contract migrations only. Engine version N must run against schema N and N-1, so an application rollback is safe.
  - Run migrations as a separate one-shot container under `pg_advisory_lock`.
  - At boot, the app refuses to start if the schema version is outside its supported range.
  - Keep `CREATE INDEX CONCURRENTLY` and backfills out of transactions and make them idempotent.
  - Patch releases contain no migrations, or expand-only ones.
  - The engine owns the `commerce` schema. Client tables live in a separate `client_ext` schema with its own journal. Clients never alter engine tables.
  - Take a `pg_dump` or snapshot before every migration.
- *Cost:* Medium.

**P1-8. Outbox and external side effects.**
- *Correction:*
  - An `outbox` table written in the *same transaction* as the state change.
  - One worker process (same image, different command) polls with `FOR UPDATE SKIP LOCKED`.
  - Delivery is at-least-once, with an idempotency or dedupe key per effect.
  - Retries use backoff, and failures end up in a dead-letter state that raises an alert.
  - Gateway `reverse` calls must be idempotent per authority.
  - No Redis or BullMQ.
- *Cost:* Low to medium.

### P2: improve, with documented risk if deferred

- **P2-1. Astro on the Bun runtime.** Astro's own docs warn that Bun may expose rough edges. One project that targets Bun uses the official Node standalone adapter rather than the community Bun adapter, because the Bun adapter only declares Astro 5 support. Storefronts are per-client, so let them run on a Node image by default and use Bun only when benchmarked.
- **P2-2. Don't derive public API schemas from Drizzle tables.** It couples the public contract to your columns and creates TypeBox version issues. Write DTOs by hand.
- **P2-3. Module boundaries.** Use folders plus a `no-restricted-imports` rule (each module exposes only `index.ts`), not separate packages per module.
- **P2-4. Registry and build reachability from Iran.** Never run `bun install` on the production server. Build images in CI, ship by registry or `docker save`/`load`. Self-host error tracking (GlitchTip) rather than assuming SaaS reachability. This depends on Q1 below.
- **P2-5. Bun soak test.** Run a 24-hour soak on the payment and checkout paths (memory growth, connection leaks) before the first real client. This is a hypothesis, not a finding.

### P3

- Elysia/Eden type-check time on the admin app (benchmark if the admin grows).
- A published SDK package, if a fourth client ever wants it.
- OpenAPI docs UI exposed only on staging.

---

## C. Architecture trade-off review

| Decision | Assessment | Note |
|---|---|---|
| Modular monolith, one deployable | **Sound** | Cross-module transactions stay simple |
| Per-client deployment and DB | **Sound** | Blast radius is one client |
| Postgres | **Sound** | Strong fit for conditional updates and outbox |
| Better Auth for authN | **Sound** | Provided authZ and SMS budgets stay in-house |
| One Better Auth instance for admin and customers | **Questionable** | Use two instances, or prove `role` can't be set |
| Eden for storefronts | **Questionable** | Fine for admin only |
| OpenAPI-generated types | **Sound** | As a thin client, not a package |
| Registry-published SDK | **Overengineered** | Attach `openapi.json` to releases |
| Multiple SDKs | **Overengineered** | One spec, one generated client per storefront |
| Bun toolchain as sole gate | **Questionable** | Dual-run and use oxlint until stable |
| Drizzle | **Sound**, with a pinned version | Decide v0 or v1 explicitly |
| Astro storefronts | **Sound** | Node image default |
| Runtime plugin/extension loader | **Overengineered** now | Use four typed adapters (see E) |
| Nx/Turborepo, package-per-module | **Overengineered** | Bun workspaces are enough |

---

## D. Missing architecture decisions (prioritized)

1. **ADR-001 Money and rounding.** Options: bigint IRR with branded type (recommended) vs decimal. Include rounding and gateway unit conversion.
2. **ADR-002 Payment attempt and order state machine.** Gateway adapter contract, callback-as-hint, reconciliation, reverse policy.
3. **ADR-003 Inventory reservation and late-payment policy.** Reserve-on-checkout vs reserve-on-payment. Late payment: honor if re-reservable, else reverse. This is a business decision (see Q2).
4. **ADR-004 Outbox and worker model.** Single worker with SKIP LOCKED vs a job library. Per-effect delivery semantics.
5. **ADR-005 Identity and topology.** Two auth instances vs one, guest cart model, same-origin reverse proxy.
6. **ADR-006 API versioning and SDK form.** Additive-only within a major version, N-1 contract tests, `openapi.json` release artifact.
7. **ADR-007 Schema ownership and upgrade policy.** `commerce` vs `client_ext`, expand/contract, supported-version window.
8. **ADR-008 Repo layout and release train.** Monorepo plus per-client repos, release branches, image tagging.
9. **ADR-009 Extension points.** Which exist and what is explicitly not extensible.
10. **ADR-010 Toolchain pinning and CI gates.**
11. **ADR-011 Operations baseline.** Backups, secrets, hosting and connectivity, observability.
12. **ADR-012 SMS abuse budgets.**

---

## E. Minimal viable architecture

**Now:**
- One **monorepo** with `apps/api` (Elysia), `apps/admin` (React+Vite, Eden OK), and `docs/adr`.
- Modules as folders inside `api`: catalog, inventory, cart, checkout, orders, payments, customers, shipping, notifications (outbox).
- Boundary rule: other modules import only a module's `index.ts`.
- One Postgres with schemas `commerce` and `client_ext`.
- One engine Docker image with migrations bundled. API and worker are two commands from the same image.
- **Per-client repo:** Astro storefront, config file, `docker-compose.yml` (Caddy, api, worker, postgres, admin static), encrypted secrets (sops+age), and a smoke suite.
- **Four typed extension points:**
  1. config
  2. payment gateway adapter
  3. shipping quote function (pure; the engine recomputes price at checkout)
  4. SMS provider adapter
- Custom backend code, if ever needed, is a client image built `FROM engine:x.y.z` against a small versioned extension API. It cannot import engine internals.
- Custom login UI lives entirely in the storefront. A genuinely new login method is an engine change, not an extension.
- Backups: nightly `pg_dump` plus WAL archiving off-site, with a quarterly restore drill.
- Uploads on a local volume behind a `StorageDriver` interface with a local default.
- Observability: structured logs, `/healthz`, and alerts for stuck payment attempts, outbox backlog, failed migrations, backup staleness, disk, and SMS budget.

**Wait:** a published SDK package, an extension loader, an S3 driver, a metrics stack, more than N and N-1 version support, image signing, RBAC beyond owner-admin (pending Q5).

**Never without a demonstrated need:** Kubernetes, Redis, microservices, a general plugin framework.

---

## F. Proposed architecture diagram

```
                       ┌───────────────────────── per-client VPS ─────────────────────────┐
 Browser ──HTTPS──▶    │  Caddy (single origin: shop.client.ir)                            │
                       │    /       ──▶ Astro storefront (client repo, SSR)                │
                       │    /api/*  ──▶ Engine API (Elysia, Bun)  ◀── SSR calls w/ cookie  │
                       │    /admin  ──▶ Admin SPA (static)                                 │
                       │                                                                   │
                       │  Engine image (one build, tagged x.y.z)                           │
                       │   ┌─────────────────────────────────────────────┐                 │
                       │   │ http routes (TypeBox DTOs, OpenAPI emitted) │                 │
                       │   │        ▼                                    │                 │
                       │   │ module services: catalog · inventory · cart │                 │
                       │   │   checkout · orders · payments · customers  │                 │
                       │   │   (import each other only via index.ts)     │                 │
                       │   │        ▼                ▲ ports             │                 │
                       │   │ Drizzle repos      adapters: gateway,       │                 │
                       │   │                    shipping, SMS            │                 │
                       │   └───────────┬─────────────────────────────────┘                 │
                       │   Worker (same image) ◀── outbox ── Postgres                      │
                       │   Migrate job (one-shot, advisory lock)  [commerce | client_ext]  │
                       └───────────────────────────────────────────────────────────────────┘
 Release artifacts:  engine image + openapi.json  ──▶  client repo generates types, pins image tag
```

---

## G. Implementation readiness

**Can Codex begin M0? Yes, scoped to the skeleton:** repo and workspaces; pinned Bun and CI gates; Postgres, Drizzle and migration harness (advisory lock, schema-version boot guard); an Elysia skeleton with `/healthz` and emitted OpenAPI; Docker image build; a Better Auth wiring spike in a branch.

**Not yet:** cart, checkout, payments, inventory.

**M0 blockers and measurable clearance criteria:**

1. **ADR-010 toolchain.** CI runs `bun check` and `tsc` with identical results on the skeleton. Lint runs via pinned oxlint and fails on a seeded floating promise.
2. **Drizzle version decision.** Written ADR naming the exact version and the relational queries API chosen.
3. **OpenAPI spike.** The emitted spec generates a client that type-checks a union error response, and CI fails on a deliberately breaking spec change.
4. **ADR-005 topology.** Same-origin proxy accepted or the alternative documented.

**Checkout-milestone blockers (ADR-001 to ADR-005 accepted), with acceptance criteria:**

- 100 concurrent reserve calls on stock = 1, repeated 1,000 times: exactly one success each run, and `reserved` never exceeds `on_hand`.
- The payment state machine property test passes with a fake gateway producing duplicate, delayed, reordered, and missing callbacks, and a forged `Status=OK` never reaches `captured`.
- Kill the worker at each defined injection point: zero lost effects, and duplicate effects only where the ADR allows.
- Migration failure injection on a restored snapshot: app N-1 passes smoke against the partially applied expand state.
- SMS test with 1,000 rotating-IP requests: provider calls stay at or below the configured per-phone and global budgets.
- A unit test covering the rial-to-gateway unit conversion for each adapter.

---

## Adversarial scenarios

**1. Two customers buy the last item.**
- *Fails:* Read-then-write stock checks.
- *Why:* The design does not specify the mechanism, so it permits this.
- *Fix:* The conditional `UPDATE ... RETURNING` plus the check constraint (P0-2).
- *Test:* The 100-concurrent, 1,000-iteration test above, on real Postgres.

**2. Gateway reports success after the reservation expired.**
- *Fails:* Either an order is fulfilled with no stock, or the customer pays and gets nothing.
- *Why:* No late-payment policy exists.
- *Fix:* On callback, attempt an atomic re-reserve. If it succeeds, proceed to verify. If not, do not verify. Call `reverse` if the gateway requires it, or let the gateway's unverified-payment refund window apply (confirm per gateway). Mark the attempt `voided_late`.
- *Test:* Fake gateway returns success at t+expiry+1. Assert the order state and that exactly one reverse or no-verify path is taken.

**3. A checkout security defect needs patching across three stores.**
- *Fails:* Only if checkout logic leaks into storefronts or clients forked the engine.
- *Why:* The brief forbids SDK-owned correctness, which is right. The release mechanism is still undefined.
- *Fix:* Release-branch patch (migration-free), one image, a per-client smoke suite on a restored snapshot, canary client first, then the rest (full sequence below).
- *Test:* Each client repo's smoke suite runs against the candidate image in CI.

**4. Client B's SDK is older than the updated backend.**
- *Fails:* A renamed field, a removed enum value, or a changed error shape.
- *Why:* The brief has no compatibility policy.
- *Fix:* Additive-only changes within a major version, `/v1/meta` exposing the API version and minimum supported client version, and storefront code with default branches for unknown enum values.
- *Test:* CI runs the previous release's generated client against the new engine.

**5. A production migration fails halfway.**
- *Fails:* Non-transactional statements (`CONCURRENTLY`, backfills) leave partial state, or the app starts against an unfinished schema.
- *Why:* Nothing defines migration sequencing.
- *Fix:* Expand/contract, a separate migrate step under an advisory lock, a pre-migration snapshot, and a boot-time schema-version guard.
- *Test:* Kill the migration mid-run on a prod-sized restored snapshot. Then run app N-1 and its smoke suite.

**6. SMS OTP exploited for cost or auth bypass.**
- *Fails:* IP-only limits are evaded with proxies, and only the 3-attempt cap protects verification.
- *Fix:* Per-phone and global budgets, DB-backed limiter storage, format validation, and a proof-of-work challenge (P1-5).
- *Test:* The 1,000-request rotating-IP test, plus brute-force attempts against a single code.

**7. Worker crashes between committing an order update and the external side effect.**
- *Fails:* The customer is never notified, or a gateway reverse is never issued.
- *Why:* Without an outbox there is no durable record that the effect is owed.
- *Fix:* The outbox row commits atomically with the state change. The worker retries it, and each effect has a dedupe key (P1-8).
- *Test:* `kill -9` the worker at defined points, restart, and assert effect counts.

### Critical patch release sequence (three clients, different storefront versions)

1. Reproduce the defect with a failing test and fix it on the release branch cut from the last tag. Policy: support N and N-1 minors, with patches backported.
2. CI runs unit tests, DB integration tests on real Postgres, the N-1 client contract test, and each client's storefront smoke suite against the candidate image.
3. Tag `x.y.z`. Build and push the image with `openapi.json`. The changelog states "migrations: none" or "expand-only".
4. For each client, restore the latest prod snapshot to staging, run migrations, and run the smoke suite.
5. Deploy the least risky client first. Per client: backup, migrate, start the new containers, health-check, switch Caddy. Watch the payment success rate and errors for 30 to 60 minutes before the next client.
6. **Rollback** is the previous image tag. That is safe because the schema is expand-only. A destructive schema rollback means restoring the snapshot, which loses data written since, so patch releases must never contain destructive migrations.
7. No storefront redeploy is needed, because correctness lives in the engine. If a patch seems to need one, that is an ownership violation to fix.

---

## H. Questions for the Product Owner

1. **Hosting and connectivity:** Where will client servers live (inside Iran or abroad)? Can they reach npm, Docker registries, and GitHub, or must images be built elsewhere and shipped in?
2. **Late payments:** If a customer's payment succeeds after their stock hold expired and the item is gone, should the business refund automatically, offer backorder, or sometimes honor the sale?
3. **Customization ownership:** Will you write all client-specific backend code yourself (in-process, built into that client's image), or must clients be able to supply their own backend extensions?
4. **Traffic and downtime:** Does any client run flash-sale-style spikes with many simultaneous checkouts on limited stock, and what maintenance downtime per release is acceptable?
5. **Admin roles:** Do client staff need distinct roles (warehouse, support, finance) in V1, or is a single owner-admin enough?

---

**ARCHITECTURE REVIEW COMPLETE — AWAITING ORCHESTRATOR TRIAGE**