import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Pool } from "pg";

export type Readiness =
  { kind: "ready" } | { kind: "unavailable" } | { kind: "schemaRequired" };
const probe = Type.Array(Type.Object({ schema_ready: Type.Boolean() }));

export function createDatabase(databaseUrl: string) {
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 1000,
    query_timeout: 1500,
    max: 5,
  });
  pool.on("error", (error: Error) => {
    process.stderr.write(
      `${JSON.stringify({ event: "database_pool_error", message: error.message })}\n`,
    );
  });
  return {
    async readiness(this: void): Promise<Readiness> {
      try {
        const result: unknown = (
          await pool.query(
            `select count(*) = 2 as schema_ready from information_schema.columns
             where table_schema = 'public' and table_name = 'foundation_probe' and is_nullable = 'NO'
             and ((column_name = 'id' and data_type = 'integer') or (column_name = 'value' and data_type = 'text'))`,
          )
        ).rows;
        if (!Value.Check(probe, result)) return { kind: "unavailable" };
        return result[0]?.schema_ready
          ? { kind: "ready" }
          : { kind: "schemaRequired" };
      } catch {
        return { kind: "unavailable" };
      }
    },
    close: () => pool.end(),
  };
}
