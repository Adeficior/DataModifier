import type { Options } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { afterEach, beforeAll } from "bun:test";
import { packFormatOf, PackLoader } from "../../src/index.js";
import type { PackLoaderOptions } from "../../src/loader/pack.js";
import { createTestDataResolver } from "./testData.js";

export default function setupLoader(
  {
    load = true,
    packFormat = packFormatOf("1.20.1"),
    ...options
  }: Partial<Options & PackLoaderOptions> & { load?: boolean } = {},
  block?: (loader: PackLoader) => void,
) {
  const logger = createTestLogger();
  const loader = new PackLoader(logger, { ...options, packFormat });

  block?.(loader);

  if (load) {
    beforeAll(async () => {
      const resolver = createTestDataResolver(options);
      await loader.loadFrom(resolver);
    }, 15_0000);
  }

  afterEach(() => {
    loader.clear();
    logger.reset();
  });

  return { loader, logger };
}
