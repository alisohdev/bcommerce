# BC-ADR-009 Client customization

Status: PROPOSED

Date: 2026-10-26

Approval: Custom storefronts and the exclusion of a general-purpose runtime plugin framework are accepted. Backend extension mechanisms are not approved.

Historical reference: Review-001/ADR-009. This record does not adopt an earlier Rust/Axum ADR.

## Context

Clients need presentation freedom and may need different providers. An extension mechanism must preserve engine-owned correctness without creating a second product platform or implying isolation it does not provide.

## Proposed decision

Use validated deployment configuration first. Introduce typed payment, SMS, shipping, or storage adapters only for demonstrated requirements. Compose trusted implementations at build time through a small engine-owned entry point. Provider capability declarations govern supported operations and recovery.

Config-only clients reuse the engine image. Clients with backend source build against the same pinned engine source or documented build artifact. The build contract specifies public imports, dependencies, compatibility version, migration ownership, and required tests. A Docker FROM line alone supplies none of these guarantees.

Adapters do not import arbitrary internal modules, bypass authorization, override money/reservation/order invariants, or modify engine tables. Custom data stays in client_ext under separate migration ownership and declared engine compatibility. A shipping quote may call a provider, but the engine validates and freezes the accepted result.

Custom login UI belongs in the storefront. Enabling an existing supported customer method is configuration. A genuinely new identity mechanism requires an engine design and security review, not a generic plugin escape hatch.

## Alternatives and consequences

Runtime discovery adds lifecycle, compatibility, and trust complexity without a current need. Engine forks make patches expensive. Compiled adapters keep the runtime simple but remain privileged application code and require rebuilding for engine updates. Table schemas and TypeScript types are not a security sandbox.

## Unresolved decisions

[OPEN-06](../architecture/open-decisions.md#open-06-client-backend-customization) blocks custom adapter implementation. Confirm initial requirements and whether all code is first-party. If third parties supply untrusted backend code, reassess isolation before accepting this design. No unused adapter framework is authorized.

## Acceptance criteria

Prove that a config-only client reuses the standard image. For the first justified adapter, build from a pinned engine artifact, test the public contract, reject internal imports, preserve schema ownership, and rebuild against an engine patch. No runtime module scanning or arbitrary code upload.

## Related records

[BC-ADR-002](BC-ADR-002-payments-and-orders.md), [BC-ADR-005](BC-ADR-005-identity-and-ownership.md), [BC-ADR-007](BC-ADR-007-database-migrations.md), and [BC-ADR-008](BC-ADR-008-repositories-and-releases.md).
