import type { ResolverOptions } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { afterEach, beforeAll } from "bun:test";
import { packFormatOf, PackLoader } from "../../src/index.js";
import type { PackLoaderOptions } from "../../src/loader/pack.js";
import { createDumpResolver, createTestDataResolver } from "./testData.js";

export default function setupLoader(
  {
    load = true,
    version,
    ...options
  }: Partial<ResolverOptions & Omit<PackLoaderOptions, "packFormat">> & {
    load?: boolean;
    version: string;
  },
  block?: (loader: PackLoader) => void,
) {
  const logger = createTestLogger();
  const packFormat = packFormatOf(version);
  const loader = new PackLoader(logger, { ...options, packFormat });
  const loadDump = () => loader.loadRegistryDump(createDumpResolver(version));

  block?.(loader);

  if (load) {
    beforeAll(async () => {
      const resolver = createTestDataResolver(version, { ...options, logger });
      await loader.loadFrom(resolver);
    }, 15_0000);
  }

  afterEach(() => {
    loader.clear();
    logger.reset();
  });

  return { loader, logger, loadDump };
}
