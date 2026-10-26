# M0b verification record

Status: Local M0b foundation verification PASSED on Windows x64 and Linux x64. Remote GitHub Actions results are reported separately in the delivery and PR checks. This report makes no M0c or production-readiness claim.

Reviewed M0a baseline: fd05aea9c3dd74e44990573074b89808196e0d0e in [alisohdev/bcommerce](https://github.com/alisohdev/bcommerce).

Documentation corrections: f743b45. The original conversational ADR-003 is an alias of LOCK-04. BC-ADR-003 remains the inventory draft. [Gate separation](../architecture/implementation-gates.md) retains M0c and pre-production criteria.

## Scope

The selected [foundation design](m0b-design.md) contains no commerce business implementation. Better Auth isolation, independent Astro integration, recovery drills, extended compatibility, and live-client hardening remain deferred.

## Exact toolchain and dependencies

| Tool | Observed evidence |
| --- | --- |
| Initial Bun | Installed 1.4.2 reported missing scripts for lint, fmt, and check before any matching package scripts existed. No global upgrade was performed. |
| Stable Bun | 1.4.4, executed revision 1.4.4+38afee6c8. Bootstrap pins Windows/Linux native tarball SHA-512 integrity. Initial Windows release ZIP SHA-256 was also verified. |
| Native lint | Exact native package 1.4.4-canary.20261025.1, executed revision 1.4.4-canary.1+a8fcd319b on both platforms. Selected independently from the stable runtime. |
| Application checking | Native Bun check and root TypeScript 7.0.2. Browser-only client config uses no Bun types. |
| Generator compiler API | Exact TypeScript 5.9.3 in the API workspace, used only by generation tooling. |
| API schemas | Elysia 1.4.30, @elysiajs/openapi 1.4.16, @sinclair/typebox 0.34.52. |
| Thin client | openapi-typescript 7.13.0 and openapi-fetch 0.17.0. |
| Database tooling | drizzle-orm 0.45.4, drizzle-kit 0.31.11, pg 8.23.1. |
| Test database | PostgreSQL 17.7, image digest sha256:2006493727bd5277eece187319af1ef82b4cf82cf4fc1ed00da0775b646ac2a4. |
| Type packages and TSX fixture | @types/bun 1.4.4, @types/pg 8.23.1, @types/react 19.3.0, React 19.3.1. React is used only for isolated quality fixtures. |
| Docker | Client and server 29.1.3. Compose v2.40.3-desktop.1. |
| Bun container | Pulled oven/bun 1.4.4 with digest sha256:1d22548f177f4ff38e0c15baa3c2c46c6c2060ba2d1bc573bb4720b407548f1d. Executed its Linux binary and observed revision 1.4.4+38afee6c8. |

Published wrapper metadata referenced a native package build suffix that was not a valid platform-package version. Initial lookup failed. Direct exact platform tarball metadata resolved the artifact, and the executed binary revision above is the evidence. No linter substitution or moving canary was used.

The reviewed Git baseline normalizes the archived review to LF, while the original attachment uses CRLF. Content is identical after newline normalization. [Historical validation](../architecture/documentation-validation.md#git-limitation) records both hashes. Source and migration line endings need deterministic checkout rules for cross-platform checksum compatibility.

## Foundation checks

Implementation source was integrated as commit 2f84641b37260e7074dcc985bdcc0686b21f9573. The parent independently bootstrapped a fresh canonical checkout and ran the checks below after the implementation owner's Windows/Linux runs.

| Executed command or proof | Result |
| --- | --- |
| Pinned stable binary running toolchain:bootstrap | Exact Windows stable and lint tarballs downloaded, integrity and executed revisions verified. |
| Pinned stable install --frozen-lockfile | Passed in the canonical checkout. Lockfile unchanged. |
| run quality on Windows with explicit DATABASE_ADMIN_URL | Passed all foundation stages. |
| run quality in the built Linux image with PostgreSQL service networking | Passed the same foundation stages. |
| format:check | 38 files formatted. Deliberately bad-format seed excluded from the normal check. |
| quality:lint | Native type-aware Bun lint passed on 19 source files, with zero warnings. |
| typecheck and typecheck:tsc | Native Bun and TypeScript 7.0.2 passed root source checking. |
| typecheck:client | Browser-only source checking passed without Bun type inclusion or engine App imports. |
| test:negative | Expected diagnostics and nonzero exits verified; clean controls passed. Details below. |
| contracts:check | Serialized OpenAPI and generated types reproduced unchanged on both platforms. |
| test:unit | 3 tests, 28 assertions, zero failures on each platform. Includes actual HTTP requests. |
| test:db | 5 tests, 29 assertions, zero failures on each platform against real PostgreSQL. |
| Drizzle Kit --version and check --config apps/api/drizzle.config.ts | Reported Kit 0.31.11 / ORM 0.45.4 and accepted the migration metadata. |
| docker compose config --quiet | Passed. |
| docker build --tag bcommerce-m0b:review . | Passed from the canonical checkout with pinned base and frozen installation. |
| Docker API and explicit migration CLI | Liveness 200; readiness 503 schemaRequired before migration; migration twice succeeded; readiness then 200. Fixture route returned 404 on the runtime API. |
| git diff for lockfile/OpenAPI/generated client | No changes after verification. |
| git diff --check | Passed. |

The first parent quality invocation omitted DATABASE_ADMIN_URL and correctly failed at the database precondition. The parent then ran the database suite with the explicit isolated development URL, and later passed the entire pipeline with that environment. No missing database prerequisite was counted as a pass.

## Negative-test evidence

The negative runner checks the expected diagnostic and a nonzero exit, rather than accepting any failure. A clean TSX control passes native lint and both type checkers.

| Invalid seed | Required evidence |
| --- | --- |
| strict-indexed.ts | TS2322 from native Bun and TypeScript 7, proving unchecked indexing remains nullable. |
| strict-optional.ts | TS2375 from both checkers, proving exact optional properties. |
| floating.ts | no-floating-promises from native Bun lint. |
| misused.ts | no-misused-promises from native Bun lint. |
| engine-import.ts | no-restricted-imports for a statically imported API internal file that otherwise resolves. |
| hooks.tsx | rules-of-hooks for the conditional hook fixture. |
| format.tsx | Check exits 1 without changing bytes; formatting fixes the temporary copy; a second format is identical; final check passes. |

The import fixture proves the native static-import restriction. It does not claim that this rule prevents every dynamic import or require call.

## OpenAPI and migration evidence

The separate contract fixture app validates discriminated unions, optional/nullable fields, cookies, explicit errors, invalid requests, invalid responses, and large integer-shaped strings. The generated client performs real HTTP calls. The strings approve no monetary policy. Runtime health application routes exclude the fixture app.

Migration tests prove fresh/repeated convergence, no startup DDL, real prerequisite readiness, concurrent migrators applying a non-idempotent insert once, transactional DDL/journal rollback and retry, and physical session termination followed by safe same-bundle retry. PostgreSQL lock checkpoints coordinate the failure cases instead of assuming timing. History tests reject changed checksums, missing/future entries, and malformed local timestamp ordering before pending work.

All test databases have random bcommerce_m0b_test_ names registered as owned by the test process. Cleanup validates ownership before dropping them. No production or pre-existing business database was used.

## Review and CI

A separate native GPT-6.1 Sol review found no actionable M0b correctness or test gaps. It independently reran contracts:check and typecheck:client, checked the installed Drizzle session implementation, and found no source comments or suppressions requiring removal. Comment deletions and MUST KILL findings were both zero. The review used the configured model family and did not establish model-family diversity.

The committed GitHub Actions workflow runs frozen installation and the same quality pipeline in the pinned Bun image with pinned PostgreSQL, plus a separate Docker build job. Checkout is pinned to a verified action commit. The image does not contain Git, so generated freshness checks compare artifact contents directly. [Workflow runs](https://github.com/alisohdev/bcommerce/actions/workflows/foundation.yml) provide the remote result; local passes are not presented as remote CI passes.

## Demonstrated compatibility findings

The initial generation command failed with TypeError involving ts.factory.createKeywordTypeNode. Parent probes confirmed root TypeScript 7.0.2 has no factory API and generator TypeScript 5.9.3 does. The generator declares a TypeScript 5 peer. Exact 5.9.3 is isolated with generation tooling, while application verification retains root 7.0.2 and native Bun. Both platforms now reproduce the generated artifacts and pass the HTTP proof. This is a tooling dependency split, not a stack substitution.

The pinned Bun formatter rejected a proposed fmt.ignore configuration key. Supported CLI exclusion patterns replaced it. Temporary formatting probes also use an explicit empty ignore file so the deliberately ignored test directory cannot produce a false pass.

The first Linux image pipeline revealed nested Windows dependency symlinks copied into the container. Excluding both root and nested node_modules fixed the context. The rebuilt image passed the complete Linux pipeline. The parent also confirmed tar exists and Git does not in the base image; CI uses explicit artifact comparisons instead of a nonexistent Git command.

## Git and delivery

Delivery branch is codex/m0b-foundation. One implementation owner used an isolated worktree on codex/m0b-implementation. Its reviewed implementation was cherry-picked into the delivery branch. No merge, deployment, M0c work, or commerce implementation is authorized by this verification record.

The implementation adds two workspace manifests, an exact lockfile, 19 checked TypeScript files including generated client types, schema/migration metadata, synthetic negative fixtures, Docker/Compose configuration, and the GitHub Actions workflow. Documentation changes record sign-off, historical aliases, gate separation, setup, design, and evidence. The historical review's committed content is unchanged.

## Remaining limits

There is no unresolved local M0b implementation blocker after these checks. Remote CI must be read from its actual run. TECH-04, OPEN-01 through OPEN-06, M0c integration, dependency/security hardening, recovery objectives, production image hardening, and commerce gates remain outside this foundation proof. The supported bootstrap platforms are explicitly Windows x64 and Linux x64.
