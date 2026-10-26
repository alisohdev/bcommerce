import { createHash } from "node:crypto";
import { chmod, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { root, verifyBinary } from "./toolchain.ts";

const artifacts = {
  win32: {
    stable:
      "sha512-a3LNctBVO8PjePsFZfwDleF2JXYf2BfQ1u/PLRnBDLnC2Riml+4+LgJpKj4xRGhB92KweGyQI5PXaTkP9qypMQ==",
    lint: "sha512-9L1TTSEdNmFG+ub+Tw0rqMJqgBxp+HUIVviLBsKvpBUexFVviDTYhil7M/X5szDIxNtNLJiqNvWNX6a72HpN0A==",
  },
  linux: {
    stable:
      "sha512-CHbbkmHVM28T1GFq+6GL4Ao4ujwwYwj1CxFFwEFzLanPfNsId9AhbIP0Q4reWuWBkGimUkoQygrK7Rgjtj3vog==",
    lint: "sha512-JBaH3jp3VfMavmAvzz0UHlP+9kByfKGGx9gLUz36LKwvDeGot22MDTnMkSQJ4KpIxN9tN5FsmfMUrJ2lb1ojRA==",
  },
};

if (
  process.arch !== "x64" ||
  (process.platform !== "win32" && process.platform !== "linux")
) {
  throw new Error(
    "The pinned foundation toolchain supports Windows x64 and Linux x64.",
  );
}
for (const kind of ["stable", "lint"] satisfies Array<"stable" | "lint">) {
  const version = kind === "stable" ? "1.4.4" : "1.4.4-canary.20261025.1";
  const platform = process.platform === "win32" ? "windows" : "linux";
  const name = `bun-${platform}-x64`;
  const url = `https://registry.npmjs.org/@oven/${name}/-/${name}-${version}.tgz`;
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Tool download failed: ${response.status}`);
  const body = new Uint8Array(await response.arrayBuffer());
  const actual = `sha512-${createHash("sha512").update(body).digest("base64")}`;
  if (actual !== artifacts[process.platform][kind])
    throw new Error(`Integrity mismatch: ${url}`);
  const destination = resolve(root, ".tools", kind);
  await mkdir(destination, { recursive: true });
  const archive = resolve(destination, "bun.tgz");
  await Bun.write(archive, body);
  const extract = Bun.spawnSync(["tar", "-xzf", archive, "-C", destination], {
    stdout: "inherit",
    stderr: "inherit",
  });
  if (extract.exitCode !== 0) throw new Error("Tool extraction failed");
  if (process.platform === "linux")
    await chmod(resolve(destination, "package/bin/bun"), 0o755);
  verifyBinary(kind);
  process.stdout.write(`${kind}: verified ${version}\n`);
}
