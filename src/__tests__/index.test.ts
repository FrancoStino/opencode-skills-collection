import {
  test,
  expect,
  describe,
  beforeEach,
  afterEach,
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
  server: (ctx: unknown) => Promise<Record<string, unknown>>;
};

const ensureDirCalls: string[] = [];
const runSkillPointerCalls: RunSkillPointerArgs[] = [];
let runSkillPointerShouldThrow = false;

// Isolate the entrypoint from its downstream side effects. mock.module
// overrides are scoped to this test file by the Bun runner; there is no
// cross-file restore to perform here.
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

function expectedSkillsDir(): string {
  return path.join(os.homedir(), ".config", "opencode", "skills");
}

describe("plugin entrypoint (OpenCode V2)", () => {
  beforeEach(async () => {
    ensureDirCalls.length = 0;
    runSkillPointerCalls.length = 0;
    runSkillPointerShouldThrow = false;
    // Dynamic import: mock.module() overrides above must be registered before
    // src/index.ts loads, so a static import cannot be used here.
    plugin = (await import("../index.js"))
      .default as unknown as PluginDefinition;
  });

  afterEach(() => {
    runSkillPointerShouldThrow = false;
  });

  test("exposes a V2 plugin definition with the collection id", () => {
    expect(plugin).toBeDefined();
    expect(plugin.id).toBe("opencode-skills-collection");
    expect(typeof plugin.setup).toBe("function");
  });

  test("setup prepares the active skills dir and runs the pointer pipeline", async () => {
    await plugin.setup(undefined);

    const expected = expectedSkillsDir();

    expect(ensureDirCalls).toEqual([expected]);
    expect(runSkillPointerCalls).toHaveLength(1);
    expect(runSkillPointerCalls[0].activeSkillsDir).toBe(expected);
    expect(runSkillPointerCalls[0].bundledSkillsPath).toEndWith(
      path.join("bundled-skills"),
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

describe("plugin entrypoint (OpenCode V1 back-compat)", () => {
  beforeEach(async () => {
    ensureDirCalls.length = 0;
    runSkillPointerCalls.length = 0;
    runSkillPointerShouldThrow = false;
    plugin = (await import("../index.js"))
      .default as unknown as PluginDefinition;
  });

  afterEach(() => {
    runSkillPointerShouldThrow = false;
  });

  test("exposes a server function returning empty hooks", async () => {
    expect(typeof plugin.server).toBe("function");
    const hooks = await plugin.server({} as unknown);
    expect(hooks).toEqual({});
  });

  test("server runs the same startup pipeline as setup", async () => {
    await plugin.server({} as unknown);

    const expected = expectedSkillsDir();

    expect(ensureDirCalls).toEqual([expected]);
    expect(runSkillPointerCalls).toHaveLength(1);
    expect(runSkillPointerCalls[0].activeSkillsDir).toBe(expected);
    expect(runSkillPointerCalls[0].bundledSkillsPath).toEndWith(
      path.join("bundled-skills"),
    );
  });

  test("server reports pipeline errors to stderr without throwing", async () => {
    runSkillPointerShouldThrow = true;
    const writes: string[] = [];
    const originalWrite = process.stderr.write;

    process.stderr.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;

    let hooks: unknown;
    try {
      hooks = await plugin.server({} as unknown);
    } finally {
      process.stderr.write = originalWrite;
    }

    expect(hooks).toEqual({});
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain("[opencode-skills-collection]");
    expect(writes[0]).toContain("skill pointer failure");
  });
});
