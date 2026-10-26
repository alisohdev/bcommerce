import { afterAll, beforeAll, expect, test } from "bun:test";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { Client } from "pg";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createApp } from "../src/app.ts";
import { createDatabase } from "../src/db/database.ts";
import { migrateDatabase, migrationsFolder } from "../src/db/migrate.ts";

const adminUrl = process.env.DATABASE_ADMIN_URL;
const admin = new Client({
  connectionString: adminUrl,
  connectionTimeoutMillis: 5000,
});
const databases = new Set<string>();
const temporaryRoot = resolve(
  import.meta.dir,
  "../../../..",
  ".tools/db-migrations",
);
const probeSql =
  "CREATE TABLE foundation_probe (id integer PRIMARY KEY, value text NOT NULL);";
const checkpointSql = "SELECT pg_advisory_xact_lock(184608702, 1);";
const journalRows = Type.Array(
  Type.Object({ hash: Type.String(), created_at: Type.String() }),
);
const activityRows = Type.Array(Type.Object({ pid: Type.Integer() }));

beforeAll(async () => {
  if (!adminUrl)
    throw new Error(
      "Set DATABASE_ADMIN_URL to the isolated development PostgreSQL admin database",
    );
  await admin.connect();
  await mkdir(temporaryRoot, { recursive: true });
});
afterAll(async () => {
  for (const name of databases) await dropDatabase(name);
  await admin.end();
});
async function dropDatabase(name: string) {
  if (!/^bcommerce_m0b_test_[a-f0-9]+$/.test(name) || !databases.has(name))
    throw new Error("Refusing to drop an unowned test database");
  await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);
  databases.delete(name);
}
async function withDatabase(
  operation: (url: string, client: Client) => Promise<void>,
) {
  if (!adminUrl) throw new Error("DATABASE_ADMIN_URL is required");
  const name = `bcommerce_m0b_test_${crypto.randomUUID().replaceAll("-", "")}`;
  await admin.query(`CREATE DATABASE "${name}"`);
  databases.add(name);
  const url = new URL(adminUrl);
  url.pathname = `/${name}`;
  const client = new Client({ connectionString: url.href });
  try {
    await client.connect();
    await operation(url.href, client);
  } finally {
    await client.end();
    await dropDatabase(name);
  }
}
async function withBundle(
  sql: string[],
  operation: (folder: string) => Promise<void>,
  times = sql.map((_, index) => index + 1),
) {
  const folder = await mkdtemp(resolve(temporaryRoot, "bundle-"));
  if (!folder.startsWith(`${temporaryRoot}${sep}`))
    throw new Error("Unsafe bundle cleanup path");
  try {
    await mkdir(resolve(folder, "meta"));
    const entries = sql.map((_, index) => ({
      idx: index,
      version: "7",
      when: times[index],
      tag: `000${index}_foundation_probe`,
      breakpoints: true,
    }));
    await Bun.write(
      resolve(folder, "meta/_journal.json"),
      JSON.stringify({ version: "7", dialect: "postgresql", entries }),
    );
    for (const [index, statement] of sql.entries())
      await Bun.write(
        resolve(folder, `000${index}_foundation_probe.sql`),
        statement,
      );
    await operation(folder);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}
async function history(client: Client) {
  const rows: unknown = (
    await client.query(
      "select hash, created_at::text from drizzle.__drizzle_migrations order by id",
    )
  ).rows;
  if (!Value.Check(journalRows, rows))
    throw new Error("Unexpected migration history rows");
  return rows;
}
async function waitForAdvisory(client: Client, applicationName: string) {
  const deadline = performance.now() + 10_000;
  while (performance.now() < deadline) {
    const rows: unknown = (
      await client.query(
        "select pid from pg_stat_activity where application_name = $1 and wait_event_type = 'Lock' and wait_event = 'advisory'",
        [applicationName],
      )
    ).rows;
    if (!Value.Check(activityRows, rows))
      throw new Error("Unexpected PostgreSQL activity rows");
    if (rows[0]) return rows[0].pid;
    await Bun.sleep(20);
  }
  throw new Error(`No advisory wait checkpoint observed: ${applicationName}`);
}

test("fresh and repeat migrations converge; runtime startup never migrates; readiness reflects actual prerequisites", async () => {
  await withDatabase(async (databaseUrl, client) => {
    const database = createDatabase(databaseUrl);
    try {
      const app = createApp(database.readiness);
      expect(
        (await app.handle(new Request("http://localhost/health/live"))).status,
      ).toBe(200);
      const before = await app.handle(
        new Request("http://localhost/health/ready"),
      );
      expect(before.status).toBe(503);
      expect(await before.json()).toEqual({ kind: "schemaRequired" });
      expect(
        (
          await client.query(
            "select to_regclass('public.foundation_probe') as relation",
          )
        ).rows,
      ).toEqual([{ relation: null }]);
      await migrateDatabase({ databaseUrl });
      const first = await history(client);
      expect(first).toEqual(
        readMigrationFiles({ migrationsFolder }).map((migration) => ({
          hash: migration.hash,
          created_at: String(migration.folderMillis),
        })),
      );
      await migrateDatabase({ databaseUrl });
      expect(await history(client)).toEqual(first);
      const ready = await app.handle(
        new Request("http://localhost/health/ready"),
      );
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({ kind: "ready" });
      await client.query("alter table foundation_probe drop column value");
      expect(await database.readiness()).toEqual({ kind: "schemaRequired" });
    } finally {
      await database.close();
    }
  });
  const unavailable = createDatabase(
    "postgresql://invalid:invalid@127.0.0.1:1/unavailable",
  );
  try {
    expect(await unavailable.readiness()).toEqual({ kind: "unavailable" });
  } finally {
    await unavailable.close();
  }
});

test("two migrators serialize one physical session each and apply work once", async () => {
  await withDatabase(async (databaseUrl, client) => {
    await withBundle(
      [
        `${probeSql}\n--> statement-breakpoint\n${checkpointSql}\n--> statement-breakpoint\nINSERT INTO foundation_probe VALUES (1, 'once');`,
      ],
      async (folder) => {
        await client.query("select pg_advisory_lock(184608702, 1)");
        const firstName = `m0b_first_${crypto.randomUUID()}`;
        const secondName = `m0b_second_${crypto.randomUUID()}`;
        const first = migrateDatabase({
          databaseUrl,
          folder,
          applicationName: firstName,
        });
        const firstHandled = first.then(
          () => null,
          (error: unknown) => error,
        );
        let secondHandled: Promise<unknown> | undefined;
        try {
          await waitForAdvisory(client, firstName);
          secondHandled = migrateDatabase({
            databaseUrl,
            folder,
            applicationName: secondName,
          }).then(
            () => null,
            (error: unknown) => error,
          );
          await waitForAdvisory(client, secondName);
        } finally {
          await client.query("select pg_advisory_unlock(184608702, 1)");
        }
        expect(await firstHandled).toBeNull();
        expect(await secondHandled).toBeNull();
        expect(await history(client)).toHaveLength(1);
        expect(
          (await client.query("select id, value from foundation_probe")).rows,
        ).toEqual([{ id: 1, value: "once" }]);
      },
    );
  });
});

test("transactional SQL failure rolls back DDL and journal; corrected retry succeeds", async () => {
  await withDatabase(async (databaseUrl, client) => {
    await withBundle(
      [`${probeSql}\n--> statement-breakpoint\nSELECT 1 / 0;`],
      async (folder) => {
        await expect(
          migrateDatabase({ databaseUrl, folder }),
        ).rejects.toThrow();
        expect(
          (
            await client.query(
              "select to_regclass('public.foundation_probe') as relation",
            )
          ).rows,
        ).toEqual([{ relation: null }]);
        expect(await history(client)).toEqual([]);
        await Bun.write(resolve(folder, "0000_foundation_probe.sql"), probeSql);
        await migrateDatabase({ databaseUrl, folder });
        expect(await history(client)).toHaveLength(1);
      },
    );
  });
});

test("session termination at PostgreSQL checkpoint releases the lock and permits same-bundle retry", async () => {
  await withDatabase(async (databaseUrl, client) => {
    await withBundle(
      [`${probeSql}\n--> statement-breakpoint\n${checkpointSql}`],
      async (folder) => {
        await client.query("select pg_advisory_lock(184608702, 1)");
        const applicationName = `m0b_terminated_${crypto.randomUUID()}`;
        const failed = migrateDatabase({
          databaseUrl,
          folder,
          applicationName,
        }).then(
          () => ({ kind: "completed" }),
          () => ({ kind: "failed" }),
        );
        try {
          const pid = await waitForAdvisory(client, applicationName);
          await admin.query("select pg_terminate_backend($1)", [pid]);
          expect(await failed).toEqual({ kind: "failed" });
        } finally {
          await client.query("select pg_advisory_unlock(184608702, 1)");
        }
        expect(
          (
            await client.query(
              "select to_regclass('public.foundation_probe') as relation",
            )
          ).rows,
        ).toEqual([{ relation: null }]);
        expect(await history(client)).toEqual([]);
        await migrateDatabase({ databaseUrl, folder });
        expect(await history(client)).toHaveLength(1);
      },
    );
  });
});

test("tampered checksums, gaps, future entries and malformed local ordering fail before pending SQL", async () => {
  await withDatabase(async (databaseUrl, client) => {
    await withBundle(
      [
        probeSql,
        "INSERT INTO foundation_probe VALUES (1, 'second');",
        "INSERT INTO foundation_probe VALUES (2, 'pending');",
      ],
      async (folder) => {
        const journalPath = resolve(folder, "meta/_journal.json");
        const full = await Bun.file(journalPath).text();
        await withBundle(
          [probeSql, "INSERT INTO foundation_probe VALUES (1, 'second');"],
          async (prefix) => {
            await migrateDatabase({ databaseUrl, folder: prefix });
          },
        );
        const original = await history(client);
        await client.query(
          "update drizzle.__drizzle_migrations set hash = 'tampered' where created_at = 1",
        );
        await expect(migrateDatabase({ databaseUrl, folder })).rejects.toThrow(
          "prefix",
        );
        await client.query(
          "update drizzle.__drizzle_migrations set hash = $1 where created_at = 1",
          [original[0]?.hash],
        );
        await client.query(
          "delete from drizzle.__drizzle_migrations where created_at = 1",
        );
        await expect(migrateDatabase({ databaseUrl, folder })).rejects.toThrow(
          "prefix",
        );
        await client.query(
          "truncate drizzle.__drizzle_migrations restart identity",
        );
        for (const row of original)
          await client.query(
            "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
            [row.hash, row.created_at],
          );
        await client.query(
          "insert into drizzle.__drizzle_migrations (hash, created_at) values ('future', 1000)",
        );
        await expect(migrateDatabase({ databaseUrl, folder })).rejects.toThrow(
          "prefix",
        );
        expect(
          (await client.query("select id from foundation_probe order by id"))
            .rows,
        ).toEqual([{ id: 1 }]);
        await client.query(
          "delete from drizzle.__drizzle_migrations where created_at = 1000",
        );
        await Bun.write(journalPath, full);
        await migrateDatabase({ databaseUrl, folder });
        expect(await history(client)).toHaveLength(3);
      },
    );
  });
  await withDatabase(async (databaseUrl, client) => {
    await withBundle(
      [probeSql, "INSERT INTO foundation_probe VALUES (1, 'bad ordering');"],
      async (folder) => {
        await expect(migrateDatabase({ databaseUrl, folder })).rejects.toThrow(
          "strictly increasing",
        );
        expect(
          (
            await client.query(
              "select to_regclass('drizzle.__drizzle_migrations') as relation",
            )
          ).rows,
        ).toEqual([{ relation: null }]);
      },
      [2, 1],
    );
  });
});
