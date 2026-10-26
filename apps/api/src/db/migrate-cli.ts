import { readConfig } from "../config.ts";
import { migrateDatabase } from "./migrate.ts";

const config = readConfig(process.env);
await migrateDatabase({ databaseUrl: config.databaseUrl });
process.stdout.write(`${JSON.stringify({ event: "migrations_complete" })}\n`);
