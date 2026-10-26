import { afterAll, beforeAll, expect, test } from "bun:test";
import { createFoundationClient } from "@bcommerce/api-client";
import { createApp } from "../src/app.ts";
import { createContractFixture } from "../src/contract-fixture.ts";

const fixture = createContractFixture();
let baseUrl = "";
beforeAll(async () => {
  fixture.listen({ port: 0, hostname: "127.0.0.1" });
  await fixture.modules;
  if (!fixture.server) throw new Error("Fixture HTTP server did not start");
  baseUrl = `http://127.0.0.1:${fixture.server.port}`;
});
afterAll(async () => {
  await fixture.stop();
});

test("generated thin client performs discriminated union, optional, nullable and string round trips over HTTP", async () => {
  const client = createFoundationClient(baseUrl);
  const result = await client.POST("/fixture/echo", {
    body: {
      kind: "text",
      text: "fixture",
      nullable: null,
      integerString: "900719925474099312345",
    },
  });
  expect(result.response.status).toBe(200);
  expect(result.data).toEqual({
    kind: "text",
    text: "fixture",
    nullable: null,
    integerString: "900719925474099312345",
  });
  expect(result.data).not.toHaveProperty("note");
  expect(result.response.headers.get("set-cookie")).toContain(
    "fixture=serialization-only",
  );
  expect(result.response.headers.get("set-cookie")).toContain("HttpOnly");
  const withOptional = await client.POST("/fixture/echo", {
    body: {
      kind: "text",
      text: "fixture",
      nullable: "present",
      note: "optional",
      integerString: "0",
    },
  });
  expect(withOptional.data).toHaveProperty("note", "optional");
  const count = await client.POST("/fixture/echo", {
    body: { kind: "count", count: 3 },
  });
  expect(count.data).toEqual({ kind: "count", count: 3 });
  const rejected = await client.GET("/fixture/error");
  expect(rejected.response.status).toBe(409);
  expect(rejected.error).toEqual({ kind: "error", code: "fixture_rejected" });
});

test("actual request and response validation reject malformed fixtures", async () => {
  for (const body of [
    { kind: "text", text: "x", nullable: null, integerString: 1 },
    { kind: "text", text: "x", integerString: "1" },
    { kind: "text", text: "x", nullable: null, integerString: "1.5" },
    { kind: "count", count: -1 },
    { kind: "count", count: 1, unexpected: "rejected" },
    { kind: "unknown" },
  ]) {
    const response = await fetch(`${baseUrl}/fixture/echo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      kind: "error",
      code: "invalid_request",
    });
  }
  const response = await fetch(`${baseUrl}/fixture/invalid-response`);
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({
    kind: "error",
    code: "invalid_response",
  });
});

test("production app exposes health and keeps fixture endpoints out", async () => {
  const app = createApp(() => Promise.resolve({ kind: "schemaRequired" }));
  const live = await app.handle(new Request("http://localhost/health/live"));
  expect(live.status).toBe(200);
  expect(await live.json()).toEqual({ kind: "live" });
  const ready = await app.handle(new Request("http://localhost/health/ready"));
  expect(ready.status).toBe(503);
  expect(await ready.json()).toEqual({ kind: "schemaRequired" });
  expect(
    (await app.handle(new Request("http://localhost/fixture/error"))).status,
  ).toBe(404);
});
