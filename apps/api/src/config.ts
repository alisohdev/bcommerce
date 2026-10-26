import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const configuration = Type.Object({
  databaseUrl: Type.String({ minLength: 1 }),
  port: Type.Integer({ minimum: 0, maximum: 65535 }),
});

export function readConfig(env: Record<string, string | undefined>) {
  const value = {
    databaseUrl: env.DATABASE_URL,
    port: Number(env.PORT ?? "3000"),
  };
  if (!Value.Check(configuration, value))
    throw new Error("DATABASE_URL and a valid PORT are required");
  const url = new URL(value.databaseUrl);
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:")
    throw new Error("DATABASE_URL must use PostgreSQL");
  return value;
}
