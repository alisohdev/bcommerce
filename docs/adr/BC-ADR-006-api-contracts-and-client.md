# BC-ADR-006 API contracts and client

Status: PROPOSED

Date: 2026-10-26

Approval: OpenAPI and a thin generated storefront client are ACCEPTED under LOCK-05. Detailed packaging and compatibility remain unapproved.

Historical reference: Review-001/ADR-006. This record does not adopt an earlier Rust/Axum ADR.

## Context

Independent storefront deployments need stable runtime contracts without compiling against engine internals. Type inference alone does not establish a deployable compatibility policy.

## Proposed decision

Define explicit public TypeBox DTOs independently of Drizzle tables. Export an immutable, checksum-identified OpenAPI artifact with each engine release. Separate storefront and administrative contracts and document Better Auth integration explicitly.

Propose a public /api/v1 contract. Define errors, pagination, authentication, idempotency, and amount representations. Preserve compatible behavior within the major. Changes to enum outputs and semantics require retained consumer tests even if a spec-diff tool classifies them as additive.

Generate types from a pinned local release artifact using openapi-typescript. Evaluate openapi-fetch with a minimal wrapper for transport, cancellation, errors, credentials, and idempotency helpers. SSR cookie forwarding is allowlisted to the intended engine origin and handles Set-Cookie explicitly where needed.

No engine App type imports in storefronts. No client-owned pricing, stock, payment, or authorization decisions. No automatic retry of arbitrary mutations. Scope server idempotency by operation and owner, bind it to a request fingerprint, and define retention before promising retry behavior.

Do not publish a registry SDK now. Eden may be evaluated for a dashboard released alongside the API, but it is not required. A fourth client alone does not justify SDK publication.

## Alternatives and consequences

Direct Eden typing for storefronts couples compilation to server source and version. Handwritten request types drift from the contract. Generated types reduce duplication but do not automatically validate responses or prove runtime compatibility.

## Unresolved decisions

[TECH-03](../architecture/open-decisions.md#technical-and-environment-blockers) requires representative generator fixtures. OPEN-05 covers support/deprecation duration. BC-ADR-001 must settle wire amounts. Idempotency retention and endpoint policy require acceptance before commerce use.

## Acceptance criteria

Export deterministic fixtures for unions, nullable and optional fields, error responses, cookies, and money strings. Compile and execute generated client requests. Seed a breaking change that CI rejects. Run the supported deployed consumer baselines against each candidate engine.

## Evidence and related records

[Elysia OpenAPI](https://elysiajs.com/plugins/openapi), [openapi-typescript](https://openapi-ts.dev/introduction), and [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) describe available features. They do not prove this project's exact contract output.

Related records are [BC-ADR-001](BC-ADR-001-money-and-rounding.md), [BC-ADR-005](BC-ADR-005-identity-and-ownership.md), and [BC-ADR-008](BC-ADR-008-repositories-and-releases.md).
