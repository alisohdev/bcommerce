# API contracts and storefront client

OpenAPI and a thin generated storefront client are ACCEPTED under LOCK-05. The policies below are PROPOSED in [BC-ADR-006](../adr/BC-ADR-006-api-contracts-and-client.md).

## Contract ownership

The engine owns explicit TypeBox request, success, and error DTOs. Public DTOs do not expose Drizzle rows or import database tables. Separate storefront and administrative contract groups. Better Auth integration remains version-pinned and has dedicated compatibility tests rather than being assumed to match the commerce error envelope.

Propose a versioned public prefix such as `/api/v1`. Define stable operation identifiers, pagination, error codes, authentication requirements, idempotency semantics, and amount representations. The wire representation of money remains subject to BC-ADR-001 approval.

Release the OpenAPI artifact with a checksum. A client's build consumes a pinned artifact, rather than the live production server or an engine App type. Deterministic generation must produce the same contract for the same source and toolchain.

Elysia documents a raw generated specification endpoint. That confirms an export path exists, not that every project's unions, errors, or cookies are complete. [Elysia OpenAPI documentation](https://elysiajs.com/plugins/openapi)

## Smallest viable client

Evaluate generated types through openapi-typescript and a small openapi-fetch wrapper. The wrapper handles base URL, cancellation, errors, explicit credentials, and idempotency helpers. SSR forwards only the approved cookies to the intended engine origin and handles response Set-Cookie explicitly when required. Never forward arbitrary credentials to redirects or caller-controlled hosts.

The client owns no authoritative prices, stock decisions, payment transitions, or authorization. It does not import engine source or automatically retry arbitrary mutations. No registry-published Better Commerce SDK or multiple SDK products are proposed.

The generator documents OpenAPI 3 support and openapi-fetch supplies typed requests. Their suitability for the exact engine output and Bun toolchain remains [TECH-03](open-decisions.md#technical-and-environment-blockers). [Generator documentation](https://openapi-ts.dev/introduction), [client documentation](https://openapi-ts.dev/openapi-fetch/)

## Compatibility

Propose compatible behavior within an API major. New required inputs, removed fields, changed errors, and changed semantics require explicit compatibility treatment. Adding enum values or supposedly optional outputs can still break consumers, so run retained consumer tests as well as a specification diff.

Track the contract baseline used by every deployed client in the supported set. Test those baselines against engine candidates. Define support and deprecation windows before promising them. A fourth client is not itself a reason to publish an SDK.

Interactive API documentation is restricted to approved environments or authorized users. Exported release specifications contain no credentials or private customer data.
