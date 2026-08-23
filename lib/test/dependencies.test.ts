import { describe, expect, it } from "bun:test";
import { resolveDependencies, sortModules } from "../src/installTarget";
import type { Installable } from "../src/installTarget";

const valid: Installable[] = [
  { name: "c", dependencies: { a: "required", b: "optional" } },
  { name: "a", dependencies: {} },
  { name: "e", dependencies: { b: "required" } },
  { name: "b", dependencies: { a: "required" } },
  { name: "d", dependencies: { g: "required", c: "optional" } },
  { name: "f", dependencies: {} },
  { name: "g", dependencies: {} },
];

describe("dependency resolution", () => {
  it("sorts modules correctly", () => {
    const sorted = sortModules(valid);

    const names = sorted.map((it) => it.name);

    expect(names).toMatchObject(["a", "f", "g", "b", "c", "e", "d"]);
  });

  it("resolves dependencies correctly", () => {
    const modules = resolveDependencies(
      { name: "test", dependencies: { f: "required", d: "optional" } },
      valid,
    );

    const names = modules.map((it) => it.name).toSorted();

    expect(names).toMatchObject(["a", "b", "c", "d", "f", "g"]);
  });
});
