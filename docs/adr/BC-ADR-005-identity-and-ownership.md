# BC-ADR-005 Identity and ownership

Status: PROPOSED

Date: 2026-10-26

Approval: None for isolation or topology. Better Auth and optional customer authentication are accepted constraints.

Historical reference: Review-001/ADR-005. This record does not adopt an earlier Rust/Axum ADR.

## Context

Staff authority must not be minted through public customer enrollment or recovery. Guest checkout needs ownership without mandatory customer registration. Authentication does not itself authorize access to carts, addresses, or orders.

## Proposed decision

| Option | Benefit | Obligation |
| --- | --- | --- |
| One Better Auth instance | Fewer schema and configuration paths. | Server-owned staff membership, enforced staff MFA/step-up, and recovery flows that cannot establish staff authority. |
| Two Better Auth instances | Distinct staff and customer credentials, recovery, and session policy. | Separate schema mappings, secrets, cookie names, routes, and lifecycle tests. |

Recommend two instances because optional customer methods and stricter staff recovery are different requirements. This is not mandatory library behavior or an accepted decision. Validate the selected Better Auth version and Drizzle mappings in an authorized experiment before choosing.

Staff enrollment is controlled and public staff signup is disabled. Role and membership inputs are server-owned. Every commerce endpoint checks actor permissions and resource ownership. Avoid treating UI visibility, a cookie prefix, or an authentication plugin as business authorization.

Guests receive a high-entropy opaque capability in an HttpOnly cookie, hashed at rest. Scope it to its cart or order, with expiry, rotation, revocation, and recovery rules. An order number or phone number alone is insufficient. Login merge and historical order claim require proof and a deterministic transaction. Matching a phone number does not transfer ownership automatically.

Prefer same-origin frontend/API calls. Evaluate a separate admin origin to limit storefront script exposure. Same-origin cookie prefixes do not isolate active scripts. Validate CSRF and origin handling on custom commerce routes as well as Better Auth routes. Gateway callbacks remain untrusted provider inputs and do not require a customer's browser session to reconcile.

## Alternatives and consequences

One instance can be acceptable after stronger role, login, and recovery tests. Two instances add maintenance and do not isolate a compromised backend process. A separate admin origin adds deployment configuration and does not replace authorization.

## Unresolved decisions

[OPEN-04](../architecture/open-decisions.md#open-04-identity-and-administration) blocks staff roles, methods, recovery, guest claim policy, topology, and final instance count. Customer auth and SMS remain optional.

## Acceptance criteria

Reject role injection, cross-resource access, customer-to-staff session substitution, unauthorized recovery and merge, and cross-origin mutations. Prove disabled methods stay disabled and guest checkout works without registering an account. Revoke and rotate guest capabilities without breaking authorized retries.

## Evidence and related records

Better Auth documents server-owned input fields and cookie configuration. Its authentication safeguards do not cover arbitrary commerce handlers. [Database fields](https://better-auth.com/docs/concepts/database), [cookies](https://better-auth.com/docs/concepts/cookies), [security](https://better-auth.com/docs/reference/security)

Related records are [BC-ADR-006](BC-ADR-006-api-contracts-and-client.md) and [BC-ADR-012](BC-ADR-012-sms-abuse-and-recovery.md).
