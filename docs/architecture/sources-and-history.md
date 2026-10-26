# Sources and decision history

This record distinguishes project authority from external evidence. Checked or recorded on 2026-10-26. External documentation can change. Its presence here does not establish installed versions or executed behavior.

## Authority order

1. The user's locked Bun/Elysia brief and later clarification establish LOCK-01 through LOCK-08.
2. The user's M0a instruction authorized documentation only. The subsequent M0a sign-off approved canonical GitHub commit fd05aea9c3dd74e44990573074b89808196e0d0e and authorized the M0b foundation after documentation corrections. M0c and commerce gates remain separate.
3. The [decision register](decision-register.md) records the resulting statuses and pending approvals.
4. [Claude's full Review 001](reviews/001-claude-architecture-review.md) is archived verbatim as an independent review. Its recommendations and its readiness statements have no approval authority.
5. Primary provider and library documentation supplies evidence about capabilities, subject to version-specific verification.

The prior reconciliation is the source of the proposed BC-ADR drafts, not blanket approval of them. The earlier chat discussions contain the approved baseline but no authoritative Bun/Elysia ADR collection. Earlier Rust/Axum documents are outside this architecture and are not imported as accepted decisions.

## Historical references

Review-001/ADR-001 through Review-001/ADR-012 map one-to-one to BC-ADR-001 through BC-ADR-012. The [register](decision-register.md#proposed-adrs-and-historical-aliases) preserves those aliases. P0, P1, P2, and P3 findings retain Claude's identifiers in the [disposition](review-001-disposition.md).

Conversation/ADR-003 records the original optional-customer-authentication decision and maps to ACCEPTED LOCK-04. This mapping was supplied explicitly at M0a sign-off. It is distinct from Review-001/ADR-003 and the unrenumbered BC-ADR-003 inventory proposal.

The archive intentionally retains original recommendations that this architecture modifies or rejects. Read the disposition and register before relying on it.

## Primary evidence

| Area | Source | What it supports |
| --- | --- | --- |
| Bun | [Lint](https://bun.sh/docs/lint), [format](https://bun.sh/docs/format), [check](https://bun.sh/docs/runtime/check), [1.4.4 release](https://bun.sh/blog/bun-v1.4.4) | Documented tool commands and current lint maturity. Exact selected binaries still need fixtures. |
| Astro | [TypeScript](https://docs.astro.build/en/guides/typescript/), [Bun recipe](https://docs.astro.build/en/recipes/bun/) | Astro checking requirements and runtime compatibility caution. |
| Elysia | [OpenAPI](https://elysiajs.com/plugins/openapi), [validation](https://elysiajs.com/essential/validation) | OpenAPI export and TypeBox boundary schema support. |
| Thin client | [openapi-typescript](https://openapi-ts.dev/introduction), [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) | Contract-generated types and typed transport. |
| Better Auth | [Database fields](https://better-auth.com/docs/concepts/database), [cookies](https://better-auth.com/docs/concepts/cookies), [security](https://better-auth.com/docs/reference/security), [phone](https://better-auth.com/docs/plugins/phone-number) | Server-owned fields, configurable cookies, authentication protections, and optional phone methods. |
| Drizzle | [Migrations](https://orm.drizzle.team/docs/drizzle-kit-migrate), [0.45.4 migrator source](https://github.com/drizzle-team/drizzle-orm/blob/0.45.4/drizzle-orm/src/pg-core/dialect.ts) | Migration tooling and version-specific transaction/journal behavior. |
| PostgreSQL | [Isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [locks](https://www.postgresql.org/docs/current/explicit-locking.html), [queue claims](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE) | Guarded updates, session lock lifetime, and SKIP LOCKED. |
| PostgreSQL recovery | [Concurrent indexes](https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY), [PITR](https://www.postgresql.org/docs/current/continuous-archiving.html) | Nontransactional index behavior and base-backup/WAL requirements. |
| ZarinPal | [Request](https://www.zarinpal.com/docs/sdk/nodejs/method/request), [verify](https://www.zarinpal.com/docs/sdk/nodejs/method/verify), [inquiry](https://www.zarinpal.com/docs/paymentGateway/otherMethods/Inquiry), [reverse](https://www.zarinpal.com/docs/sdk/nodejs/method/reverse) | Explicit units, stored-amount verification, distinct paid/unverified state, and constrained reversal. |
| IDPay | [Official callback sample](https://github.com/idpay/idpay-php-project/blob/master/callback.php), [configuration](https://github.com/idpay/idpay-php-project/blob/master/variables.php) | Example inquiry/verification flow. Not a complete current merchant contract. |

## Version observations

During reconciliation, direct npm registry reads reported drizzle-orm latest 0.45.4 and drizzle-kit latest 0.31.11, with 1.0.0-rc.5 under rc. Sources were the [ORM registry](https://registry.npmjs.org/drizzle-orm) and [Kit registry](https://registry.npmjs.org/drizzle-kit). These observations justify evaluating the stable pair, not installing it or requiring RQV2.

The workspace's Bun command reported 1.4.2 during initial M0a inspection. Bun 1.4.4 is a proposed validation baseline. No binary was upgraded. No immutable lint build has been selected.
