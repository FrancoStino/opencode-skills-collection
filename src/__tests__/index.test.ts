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

// Isolate the entrypoint from the skill-pointer pipeline, but keep the real
// filesystem side effect: Bun shares the module registry across test files in
// one run, so a pure no-op mock would break pointer-generator.test.ts which
// imports the real ensureDir and expects directories to exist.
mock.module("../utils/fs.utils.js", () => {
  // require() inside the factory: Bun re-executes the factory isolated,
  // so it cannot close over outer-scope imports.
  const fs = require("node:fs");
  return {
    ensureDir: (dir: string) => {
      ensureDirCalls.push(dir);
      fs.mkdirSync(dir, { recursive: true });
    },
  };
});

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
