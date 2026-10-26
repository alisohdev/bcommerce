import createClient from "openapi-fetch";
import type { paths } from "./schema.ts";

export function createFoundationClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}

export type { paths, components } from "./schema.ts";
