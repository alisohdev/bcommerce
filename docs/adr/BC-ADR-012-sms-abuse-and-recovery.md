# BC-ADR-012 SMS abuse and recovery

Status: PROPOSED

Date: 2026-10-26

Approval: Optional customer authentication including SMS OTP is accepted. Budgets, recovery policy, and delivery mechanics are unapproved.

Historical reference: Review-001/ADR-012. This record does not adopt an earlier Rust/Axum ADR.

## Context

OTP sends incur cost. IP-only controls do not bound sends from distributed sources. Phone possession and phone-number recovery also affect account ownership, especially for recycled numbers and staff accounts.

## Proposed decision

When SMS is enabled, normalize supported phone formats and enforce persistent per-phone, per-IP, verification-attempt, and global spending limits. Reserve budget atomically before provider dispatch. Make retries and ambiguous send results count conservatively so they cannot bypass spending controls. Restart must not reset limits.

Better Auth owns the selected credential and verification flow. Commerce owns provider delivery, budget policy, business permissions, and ownership claims. Disable unused methods. Guest checkout does not require an SMS account merely because the plugin exists.

Use generic responses and measure account-enumeration behavior. Delivery runs through a managed execution path with durable intent or another explicitly reliable mechanism. Never discard an unawaited SMS promise. Integrate delivery with the selected Better Auth lifecycle so persistence, OTP expiry, retries, and queued delay are understood. Restrict and expire any encrypted OTP-bearing payload and exclude it from logs.

Define resend, verification, phone-change, account recovery, recycled-number, SIM-swap, and staff recovery behavior. Customer recovery cannot establish staff authority. Matching a phone number does not automatically transfer historical guest orders.

## Alternatives and consequences

Mandatory CAPTCHA or proof-of-work adds friction and needs reachability/accessibility evidence. It is not a substitute for persistent budgets. Synchronous delivery can expose timing and availability; queued delivery can deliver stale codes. The selected path needs integration tests and explicit failure behavior.

## Unresolved decisions

[OPEN-04](../architecture/open-decisions.md#open-04-identity-and-administration) blocks supported regions, enabled methods, and recovery. OPEN-05 covers provider budgets and alert ownership. Exact limits and cooldowns have no approved defaults. Challenge adoption requires demonstrated abuse and Product Owner approval.

## Acceptance criteria

Issue 1,000 rotating-IP requests plus concurrent requests for the same phone. Provider calls and spend stay within configured limits across restart and retry. Test exhausted budgets, expired codes, duplicate delivery, failed sends, verification attempts, and unauthorized phone/account recovery. Demonstrate the enabled guest flow without customer registration.

## Evidence and related records

Better Auth documents an optional phone-number plugin and application-supplied delivery integration. Verify actual defaults and storage behavior in the pinned release. [Phone plugin](https://better-auth.com/docs/plugins/phone-number)

Related records are [BC-ADR-004](BC-ADR-004-transactional-outbox.md), [BC-ADR-005](BC-ADR-005-identity-and-ownership.md), and [BC-ADR-011](BC-ADR-011-operations-and-recovery.md).
