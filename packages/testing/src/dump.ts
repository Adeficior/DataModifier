import { createDumpLookup } from "@adeficior/data-modifier-core";
import { mockRegistryLookup } from "@adeficior/data-modifier-core/testing";
import type { Logger } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createDumpResolver } from "@adeficior/testing";
import { beforeAll } from "bun:test";

export function setupLookup(
  version: string,
  logger: Logger = createTestLogger(),
) {
  const mocked = mockRegistryLookup();

  beforeAll(async () => {
    const resolver = await createDumpResolver(version, logger);
    const lookup = await createDumpLookup(resolver);

    mocked.addCustom.mockImplementation(lookup.addCustom.bind(lookup));
    mocked.isKnown.mockImplementation(lookup.isKnown.bind(lookup));
    mocked.keys.mockImplementation(lookup.keys.bind(lookup));
    mocked.registries.mockImplementation(lookup.registries.bind(lookup));
    mocked.validateEntry.mockImplementation(lookup.validateEntry.bind(lookup));
    mocked.metadata.mockImplementation(lookup.metadata.bind(lookup));
  });

  return mocked;
}
