import { createResolver } from "@adeficior/pack-resolver";
import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { createDumpLookup } from "../src";

function dumpResolver(name: string) {
  const from = join(import.meta.dir, "resources", "dump", name);
  return createResolver({ from });
}

describe("dump registry lookup", () => {
  it("works with unversioned format", async () => {
    const resolver = await dumpResolver("v1");
    const lookup = await createDumpLookup(resolver);

    expect([...lookup.registries()].toSorted()).toMatchSnapshot(
      "v1 registries",
    );
  });

  it("works with v2 format", async () => {
    const resolver = await dumpResolver("v2");
    const lookup = await createDumpLookup(resolver);

    expect([...lookup.registries()].toSorted()).toMatchSnapshot(
      "v2 registries",
    );
  });
});
