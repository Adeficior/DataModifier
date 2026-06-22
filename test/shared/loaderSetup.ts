import { createTestResolver } from "@adeficior/pack-resolver/testing";
import type { Options } from "@pssbletrngle/pack-resolver";
import { afterEach, beforeAll } from "bun:test";
import { PackLoader } from "../../src/index.js";
import type { PackLoaderOptions } from "../../src/loader/pack.js";
import createTestLogger from "./testLogger.js";

export default function setupLoader(
  {
    load = true,
    packFormat = 15,
    ...options
  }: Partial<Options & PackLoaderOptions> & { load?: boolean } = {},
  block?: (loader: PackLoader) => void,
) {
  const logger = createTestLogger();
  const loader = new PackLoader(logger, { ...options, packFormat });

  block?.(loader);

  if (load) {
    beforeAll(async () => {
      const resolver = createTestResolver(options);
      await loader.loadFrom(resolver);
    }, 15_0000);
  }

  afterEach(() => {
    loader.clear();
    logger.reset();
  });

  return { loader, logger };
}
