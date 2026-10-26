# Run the M0b foundation

This development setup requires Docker and an existing Bun installation to execute the bootstrap script. Pinned tooling supports Windows x64 and Linux x64. M0b contains health endpoints, synthetic contracts, and a synthetic migration table. It contains no commerce behavior.

## Windows setup

In a new checkout, run these PowerShell commands. The example credentials belong only to the local development database. Keep .env untracked.

```powershell
bun run toolchain:bootstrap
$taskBun = (Resolve-Path .\.tools\stable\package\bin\bun.exe).Path
& $taskBun install --frozen-lockfile
Copy-Item .env.example .env
docker compose up -d --wait postgres
& $taskBun run quality
& $taskBun run db:migrate
& $taskBun run dev
```

The quality pipeline requires DATABASE_ADMIN_URL. Bun loads it from the copied local .env. Tests create random bcommerce_m0b_test_ databases and drop only databases registered as owned by that test process. Do not point this setting at a production server.

## Linux setup

Use the same source and lockfile with Linux binaries. Keep an existing .env intact when repeating setup.

```sh
bun run toolchain:bootstrap
./.tools/stable/package/bin/bun install --frozen-lockfile
test -e .env || cp .env.example .env
docker compose up -d --wait postgres
./.tools/stable/package/bin/bun run quality
./.tools/stable/package/bin/bun run db:migrate
./.tools/stable/package/bin/bun run dev
```

## Health and Docker

The host development API uses port 3000. Query http://127.0.0.1:3000/health/live and http://127.0.0.1:3000/health/ready. Liveness returns 200. Readiness returns 503 when PostgreSQL is unavailable or the fixture schema is missing, and 200 when prerequisites are present.

To run the API in Docker instead of the host process, stop the host dev process first and use docker compose --profile app up --build -d --wait. Run the explicit migration job with docker compose run --rm --no-deps api .tools/stable/package/bin/bun run db:migrate. Startup never runs DDL.

Use docker compose down to stop this project's services. Keep its named volume unless intentionally discarding local fixture data. This is a development image, not a production hardening claim.

## Focused commands

Run these through the pinned stable binary using the platform path above.

| Command | Purpose |
| --- | --- |
| run quality | Full foundation pipeline, including real PostgreSQL tests. |
| run quality:lint | Exact separate native Bun lint binary with type-aware rules. |
| run typecheck | Native stable Bun checking. |
| run typecheck:tsc | Root TypeScript 7.0.2 parity check. |
| run typecheck:client | Browser-only generated-client type check without Bun types. |
| run test:negative | Clean controls and expected failing type, lint, boundary, hook, and formatting cases. |
| run contracts:generate | Update committed fixture OpenAPI and generated client types. |
| run contracts:check | Fail if either generated artifact differs, without updating it. |
| run test:unit | Real HTTP client and request/response validation proof. |
| run test:db | Dedicated-session migration and readiness proofs. |
| run format:check | Non-writing supported-file format check, excluding the deliberately malformed seed. |

The root scripts are intentionally not named lint, fmt, or check. They select verified native binaries instead of shadowing absent built-ins.

Generator tooling uses its own exact TypeScript 5.9.3 compiler API dependency. Application checking remains TypeScript 7.0.2 and native Bun. No registry SDK is published and no engine App type is imported by the client.
