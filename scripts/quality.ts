import { root, verifyBinary } from "./toolchain.ts";

for (const script of [
  "format:check",
  "quality:lint",
  "typecheck",
  "typecheck:tsc",
  "typecheck:client",
  "test:negative",
  "contracts:check",
  "test:unit",
  "test:db",
]) {
  const result = Bun.spawn([verifyBinary("stable"), "run", script], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if ((await result.exited) !== 0)
    throw new Error(`Quality gate failed: ${script}`);
}
