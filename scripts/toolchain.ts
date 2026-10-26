import { resolve } from "node:path";

export const root = resolve(import.meta.dir, "..");
export const stableRevision = "1.4.4+38afee6c8";
export const lintRevision = "1.4.4-canary.1+a8fcd319b";

export function binary(kind: "stable" | "lint") {
  return resolve(
    root,
    ".tools",
    kind,
    "package",
    "bin",
    process.platform === "win32" ? "bun.exe" : "bun",
  );
}

export function verifyBinary(kind: "stable" | "lint") {
  const path = binary(kind);
  const result = Bun.spawnSync([path, "--revision"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const revision = result.stdout.toString().trim();
  if (
    result.exitCode !== 0 ||
    revision !== (kind === "stable" ? stableRevision : lintRevision)
  ) {
    throw new Error(
      `Unexpected ${kind} tool revision: ${revision}. Run bun run toolchain:bootstrap.`,
    );
  }
  return path;
}
