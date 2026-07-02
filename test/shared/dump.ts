import type { Logger } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { beforeAll } from "bun:test";
import RegistryDumpLoader from "../../src/loader/registry/dump";
import { createDumpResolver } from "./testData";

export default function setupLookup(
  version: string,
  logger: Logger = createTestLogger(),
) {
  const lookup = new RegistryDumpLoader();

  beforeAll(async () => {
    const resolver = createDumpResolver(version, logger);
    await resolver.extract(lookup);
  });

  return lookup;
}
