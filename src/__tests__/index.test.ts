import {
  test,
  expect,
  describe,
  beforeEach,
  afterEach,
  afterAll,
  mock,
} from "bun:test";
import os from "node:os";
import path from "node:path";

interface RunSkillPointerArgs {
  bundledSkillsPath: string;
  activeSkillsDir: string;
}

type PluginDefinition = {
  id: string;
  setup: (ctx: unknown) => Promise<void>;
};

const ensureDirCalls: string[] = [];
const runSkillPointerCalls: RunSkillPointerArgs[] = [];
let runSkillPointerShouldThrow = false;

// Isolate the entrypoint from its downstream side effects. These mocks are
// scoped to this file and restored in afterAll so other suites keep using the
// real implementations.
mock.module("../utils/fs.utils.js", () => ({
  ensureDir: (dir: string) => {
    ensureDirCalls.push(dir);
  },
}));

mock.module("../skill-pointer/index.js", () => ({
  runSkillPointer: (args: RunSkillPointerArgs) => {
    if (runSkillPointerShouldThrow) {
      throw new Error("skill pointer failure");
    }
    runSkillPointerCalls.push(args);
  },
}));

let plugin: PluginDefinition;

describe("plugin entrypoint (OpenCode V2)", () => {
  beforeEach(async () => {
    ensureDirCalls.length = 0;
    runSkillPointerCalls.length = 0;
    runSkillPointerShouldThrow = false;
    plugin = (await import("../index.js")).default as unknown as PluginDefinition;
  });

  afterEach(() => {
    runSkillPointerShouldThrow = false;
  });

  afterAll(() => {
    mock.restore();
  });

  test("exposes a V2 plugin definition with the collection id", () => {
    expect(plugin).toBeDefined();
    expect(plugin.id).toBe("opencode-skills-collection");
    expect(typeof plugin.setup).toBe("function");
  });

  test("setup prepares the active skills dir and runs the pointer pipeline", async () => {
    await plugin.setup(undefined);

    const expectedSkillsDir = path.join(
      os.homedir(),
      ".config",
      "opencode",
      "skills"
    );

    expect(ensureDirCalls).toEqual([expectedSkillsDir]);
    expect(runSkillPointerCalls).toHaveLength(1);
    expect(runSkillPointerCalls[0].activeSkillsDir).toBe(expectedSkillsDir);
    expect(runSkillPointerCalls[0].bundledSkillsPath).toEndWith(
      path.join("bundled-skills")
    );
  });

  test("setup reports pipeline errors to stderr without throwing", async () => {
    runSkillPointerShouldThrow = true;
    const writes: string[] = [];
    const originalWrite = process.stderr.write;

    process.stderr.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;

    try {
      await plugin.setup(undefined);
    } finally {
      process.stderr.write = originalWrite;
    }

    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain("[opencode-skills-collection]");
    expect(writes[0]).toContain("skill pointer failure");
  });
});
