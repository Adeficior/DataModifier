import type { PackLoaderOptions } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import type { ResolverOptions } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { afterEach, beforeEach } from "bun:test";
import { createDataModifier, type DataModifier } from "../../src";
import { createDumpResolver, createTestDataResolver } from "./testData";

// TODO rename
export default async function setupLoader(
  {
    load = true,
    version,
    ...options
  }: Partial<ResolverOptions & Omit<PackLoaderOptions, "packFormat">> & {
    load?: boolean;
    version: string;
  },
  block?: (loader: DataModifier) => void,
) {
  const logger = createTestLogger();
  const packFormat = packFormatOf(version);
  const loader = await createDataModifier({ ...options, logger, packFormat });
  const loadDump = async () =>
    loader.loadRegistryDump(await createDumpResolver(version));

  block?.(loader);

  if (load) {
    beforeEach(async () => {
      const resolver = await createTestDataResolver(version, {
        ...options,
        logger,
      });
      await loader.loadFrom(resolver);
    }, 15_0000);
  }

  afterEach(() => {
    // TODO re-add?
    // loader.clear();
    logger.reset();
  });

  return { loader, logger, loadDump };
}
