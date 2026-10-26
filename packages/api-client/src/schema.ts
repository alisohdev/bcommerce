export interface paths {
  "/fixture/echo": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Serialization fixture only; integerString has no money or currency semantics. */
    post: operations["echoFixture"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/fixture/error": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["rejectFixture"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: never;
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  echoFixture: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: {
        fixture?: string;
      };
    };
    requestBody: {
      content: {
        "application/json":
          | {
              integerString: string;
              /** @constant */
              kind: "text";
              note?: string;
              nullable: string | null;
              text: string;
            }
          | {
              count: string | number;
              /** @constant */
              kind: "count";
            };
        "application/x-www-form-urlencoded":
          | {
              integerString: string;
              /** @constant */
              kind: "text";
              note?: string;
              nullable: string | null;
              text: string;
            }
          | {
              count: string | number;
              /** @constant */
              kind: "count";
            };
        "multipart/form-data":
          | {
              integerString: string;
              /** @constant */
              kind: "text";
              note?: string;
              nullable: string | null;
              text: string;
            }
          | {
              count: string | number;
              /** @constant */
              kind: "count";
            };
      };
    };
    responses: {
      /** @description Response for status 200 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json":
            | {
                integerString: string;
                /** @constant */
                kind: "text";
                note?: string;
                nullable: string | null;
                text: string;
              }
            | {
                count: string | number;
                /** @constant */
                kind: "count";
              };
        };
      };
      /** @description Response for status 422 */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            /** @enum {string} */
            code: "invalid_request" | "fixture_rejected" | "invalid_response";
            /** @constant */
            kind: "error";
          };
        };
      };
    };
  };
  rejectFixture: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Response for status 409 */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            /** @enum {string} */
            code: "invalid_request" | "fixture_rejected" | "invalid_response";
            /** @constant */
            kind: "error";
          };
        };
      };
    };
  };
}
