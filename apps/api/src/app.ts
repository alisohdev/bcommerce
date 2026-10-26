import { Elysia, t } from "elysia";
import type { Readiness } from "./db/database.ts";

export function createApp(checkReadiness: () => Promise<Readiness>) {
  return new Elysia()
    .get("/health/live", (): { kind: "live" } => ({ kind: "live" }), {
      response: t.Object({ kind: t.Literal("live") }),
    })
    .get(
      "/health/ready",
      async ({ status }) => {
        const readiness = await checkReadiness();
        return readiness.kind === "ready" ? readiness : status(503, readiness);
      },
      {
        response: {
          200: t.Object({ kind: t.Literal("ready") }),
          503: t.Union([
            t.Object({ kind: t.Literal("unavailable") }),
            t.Object({ kind: t.Literal("schemaRequired") }),
          ]),
        },
      },
    );
}
