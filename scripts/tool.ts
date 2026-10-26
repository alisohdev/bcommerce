import { root, verifyBinary } from "./toolchain.ts";

const [kind, ...args] = process.argv.slice(2);
if ((kind !== "stable" && kind !== "lint") || args.length === 0) {
  throw new Error("Usage: bun scripts/tool.ts <stable|lint> <command...>");
}
const result = Bun.spawn([verifyBinary(kind), ...args], {
  cwd: root,
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});
process.exitCode = await result.exited;
