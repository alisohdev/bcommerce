import { createApp } from "./app.ts";
import { readConfig } from "./config.ts";
import { createDatabase } from "./db/database.ts";

const config = readConfig(process.env);
const database = createDatabase(config.databaseUrl);
const app = createApp(database.readiness).listen(config.port);
process.stdout.write(
  `${JSON.stringify({ event: "listening", port: app.server?.port })}\n`,
);
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await app.stop();
  await database.close();
}
process.once("SIGTERM", () => {
  close().catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  });
});
process.once("SIGINT", () => {
  close().catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  });
});
