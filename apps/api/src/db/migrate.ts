import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { resolve } from "node:path";

export const migrationsFolder = resolve(import.meta.dir, "../../drizzle");
const historySchema = Type.Array(
  Type.Object({ hash: Type.String(), created_at: Type.String() }),
);
const relationSchema = Type.Array(
  Type.Object({ relation: Type.Union([Type.String(), Type.Null()]) }),
);

function readBundle(folder: string) {
  const migrations = readMigrationFiles({ migrationsFolder: folder });
  let previous = -1;
  for (const migration of migrations) {
    if (
      !Number.isSafeInteger(migration.folderMillis) ||
      migration.folderMillis <= previous
    ) {
      throw new Error(
        "Bundled migration timestamps must be strictly increasing safe integers",
      );
    }
    previous = migration.folderMillis;
  }
  return migrations;
}

async function verifyHistory(
  client: Client,
  folder: string,
  complete: boolean,
) {
  const migrations = readBundle(folder);
  const relation: unknown = (
    await client.query(
      "select to_regclass('drizzle.__drizzle_migrations')::text as relation",
    )
  ).rows;
  if (!Value.Check(relationSchema, relation))
    throw new Error("Invalid migration relation response");
  if (!relation[0]?.relation) {
    if (complete) throw new Error("Migration journal is missing after apply");
    return;
  }
  const history: unknown = (
    await client.query(
      "select hash, created_at::text from drizzle.__drizzle_migrations order by id",
    )
  ).rows;
  if (!Value.Check(historySchema, history))
    throw new Error("Invalid migration history response");
  if (
    history.length > migrations.length ||
    (complete && history.length !== migrations.length)
  )
    throw new Error("Migration history is not a bundled prefix");
  for (const [index, entry] of history.entries()) {
    const migration = migrations[index];
    if (
      !migration ||
      entry.hash !== migration.hash ||
      entry.created_at !== String(migration.folderMillis)
    ) {
      throw new Error(
        `Migration history is not a checksum-matching ordered prefix at ${index}`,
      );
    }
  }
}

export async function migrateDatabase(options: {
  databaseUrl: string;
  folder?: string;
  applicationName?: string;
}) {
  const folder = options.folder ?? migrationsFolder;
  readBundle(folder);
  const client = new Client({
    connectionString: options.databaseUrl,
    application_name: options.applicationName ?? "bcommerce_migrator",
    connectionTimeoutMillis: 5000,
  });
  client.on("error", (error: Error) => {
    process.stderr.write(
      `${JSON.stringify({ event: "migration_session_error", message: error.message })}\n`,
    );
  });
  let locked = false;
  try {
    await client.connect();
    await client.query("select pg_advisory_lock(184608701, 1)");
    locked = true;
    await verifyHistory(client, folder, false);
    await migrate(drizzle(client), { migrationsFolder: folder });
    await verifyHistory(client, folder, true);
  } finally {
    try {
      if (locked) await client.query("select pg_advisory_unlock(184608701, 1)");
    } finally {
      await client.end();
    }
  }
}
