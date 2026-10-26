import openapiTS, { astToString } from "openapi-typescript";
import { resolve } from "node:path";
import { createContractFixture } from "../src/contract-fixture.ts";

function canonical(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map((entry: unknown) => canonical(entry));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, "en"))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}
const root = resolve(import.meta.dir, "../../..");
const app = createContractFixture();
const response = await app.handle(new Request("http://localhost/openapi/json"));
if (!response.ok) throw new Error(`OpenAPI export failed: ${response.status}`);
const document: unknown = await response.json();
const serialized = `${JSON.stringify(canonical(document), null, 2)}\n`;
const source = astToString(await openapiTS(serialized, { alphabetize: true }));
const artifacts = [
  { path: resolve(root, "apps/api/openapi.json"), source: serialized },
  { path: resolve(root, "packages/api-client/src/schema.ts"), source },
];
for (const artifact of artifacts) {
  const formatted = Bun.spawnSync(
    [process.execPath, "fmt", "--no-script", "--stdin-filepath", artifact.path],
    { stdin: Buffer.from(artifact.source), stdout: "pipe", stderr: "pipe" },
  );
  if (formatted.exitCode !== 0) throw new Error(formatted.stderr.toString());
  const output = formatted.stdout.toString();
  if (process.argv.includes("--check")) {
    if (
      !(await Bun.file(artifact.path).exists()) ||
      (await Bun.file(artifact.path).text()) !== output
    )
      throw new Error(`Contract regeneration differs: ${artifact.path}`);
  } else {
    await Bun.write(artifact.path, output);
  }
}
process.stdout.write(
  `contracts: ${process.argv.includes("--check") ? "unchanged" : "generated"}\n`,
);
