import { openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";

export const fixtureBody = t.Union([
  t.Object(
    {
      kind: t.Literal("text"),
      text: t.String({ minLength: 1 }),
      note: t.Optional(t.String()),
      nullable: t.Union([t.String(), t.Null()]),
      integerString: t.String({ pattern: "^(0|[1-9][0-9]*)$" }),
    },
    { additionalProperties: false },
  ),
  t.Object(
    { kind: t.Literal("count"), count: t.Integer({ minimum: 0 }) },
    { additionalProperties: false },
  ),
]);
const errorEnvelope = t.Object({
  kind: t.Literal("error"),
  code: t.Union([
    t.Literal("invalid_request"),
    t.Literal("fixture_rejected"),
    t.Literal("invalid_response"),
  ]),
});

export function createContractFixture() {
  return new Elysia({ normalize: false })
    .use(
      openapi({
        path: "/openapi",
        provider: null,
        documentation: {
          info: {
            title: "Bcommerce foundation serialization fixture",
            version: "0.0.1",
          },
        },
        exclude: { paths: ["/fixture/invalid-response"] },
      }),
    )
    .onError(({ code, status, error }) => {
      if (code !== "VALIDATION") return;
      const responseFailure = "type" in error && error.type === "response";
      return responseFailure
        ? status(500, { kind: "error", code: "invalid_response" })
        : status(422, { kind: "error", code: "invalid_request" });
    })
    .post(
      "/fixture/echo",
      ({ body, cookie }) => {
        cookie.fixture?.set({
          value: "serialization-only",
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        });
        return body;
      },
      {
        body: fixtureBody,
        response: { 200: fixtureBody, 422: errorEnvelope },
        cookie: t.Cookie({ fixture: t.Optional(t.String()) }),
        detail: {
          operationId: "echoFixture",
          description:
            "Serialization fixture only; integerString has no money or currency semantics.",
        },
      },
    )
    .get(
      "/fixture/error",
      ({ status }) => status(409, { kind: "error", code: "fixture_rejected" }),
      {
        response: { 409: errorEnvelope },
        detail: { operationId: "rejectFixture" },
      },
    )
    .get(
      "/fixture/invalid-response",
      () => {
        const response: { kind: "expected" } = { kind: "expected" };
        Reflect.set(response, "kind", "wrong");
        return response;
      },
      {
        response: t.Object({ kind: t.Literal("expected") }),
        detail: { hide: true },
      },
    );
}
