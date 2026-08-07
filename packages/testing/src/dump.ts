import { RegistryDumpLoader } from "@adeficior/data-modifier-core";
import { type Logger } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createDumpResolver } from "@adeficior/testing";
import { beforeAll } from "bun:test";

// TODO would not work if dump loader is moved out of core into own module, if kept there everything is fine
export function setupLookup(
  version: string,
  logger: Logger = createTestLogger(),
) {
  const lookup = new RegistryDumpLoader();

  beforeAll(async () => {
    const resolver = await createDumpResolver(version, logger);
    await resolver.extract(lookup);
  });

  return lookup;
}
