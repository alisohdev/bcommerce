import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { root, verifyBinary } from "./toolchain.ts";

const stable = verifyBinary("stable");
const lint = verifyBinary("lint");
function run(command: string[]) {
  const result = Bun.spawnSync(command, {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    code: result.exitCode,
    output: result.stdout.toString() + result.stderr.toString(),
  };
}
function assertResult(result: ReturnType<typeof run>, diagnostic?: string) {
  if (
    diagnostic
      ? result.code === 0 || !result.output.includes(diagnostic)
      : result.code !== 0
  ) {
    throw new Error(
      `Unexpected fixture result (${diagnostic ?? "clean"}):\n${result.output}`,
    );
  }
}

await mkdir(resolve(root, ".tools/negative"), { recursive: true });
const temporary = await mkdtemp(resolve(root, ".tools/negative/run-"));
if (!temporary.startsWith(`${resolve(root, ".tools/negative")}${sep}`))
  throw new Error("Unsafe fixture cleanup path");
try {
  const fixtures = [
    "control.tsx",
    "negative/strict-indexed.ts",
    "negative/strict-optional.ts",
    "negative/engine-import.ts",
    "negative/hooks.tsx",
  ];
  for (const file of fixtures) {
    const config = join(temporary, "tsconfig.json");
    await Bun.write(
      config,
      JSON.stringify({
        extends: resolve(root, "tsconfig.json"),
        files: [resolve(root, "fixtures", file)],
        include: [],
        exclude: [],
      }),
    );
    const diagnostic = file.includes("strict-indexed")
      ? "TS2322"
      : file.includes("strict-optional")
        ? "TS2375"
        : undefined;
    assertResult(
      run([stable, "check", "--no-script", "--no-pretty", "--project", config]),
      diagnostic,
    );
    assertResult(
      run([
        stable,
        "node_modules/typescript/bin/tsc",
        "--pretty",
        "false",
        "--project",
        config,
      ]),
      diagnostic,
    );
  }
  assertResult(
    run([
      lint,
      "lint",
      "--no-script",
      "--type-aware",
      "--max-warnings",
      "0",
      "fixtures/control.tsx",
    ]),
  );
  for (const [file, diagnostic] of [
    ["floating.ts", "no-floating-promises"],
    ["misused.ts", "no-misused-promises"],
    ["engine-import.ts", "no-restricted-imports"],
    ["hooks.tsx", "rules-of-hooks"],
  ]) {
    assertResult(
      run([
        lint,
        "lint",
        "--no-script",
        "--type-aware",
        "--max-warnings",
        "0",
        `fixtures/negative/${file}`,
      ]),
      diagnostic,
    );
    process.stdout.write(`negative: ${diagnostic}\n`);
  }
  const bad = join(temporary, "format.tsx");
  const ignore = join(temporary, "empty.ignore");
  await Bun.write(ignore, "");
  const formatter = [stable, "fmt", "--no-script", "--ignore-path", ignore];
  await Bun.write(
    bad,
    await readFile(resolve(root, "fixtures/negative/format.tsx")),
  );
  const before = await readFile(bad, "utf8");
  const invalidFormat = run([...formatter, "--check", bad]);
  if (invalidFormat.code !== 1 || (await readFile(bad, "utf8")) !== before)
    throw new Error(
      `Formatting check must fail without writing: ${invalidFormat.output}`,
    );
  assertResult(run([...formatter, bad]));
  const first = await readFile(bad, "utf8");
  assertResult(run([...formatter, bad]));
  if ((await readFile(bad, "utf8")) !== first)
    throw new Error("Formatter is not idempotent");
  assertResult(run([...formatter, "--check", bad]));
  process.stdout.write(
    "negative: strict indexed/optional parity; non-writing format; idempotence\n",
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
