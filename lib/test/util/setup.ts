import {
  packFormatOf,
  type PackLoaderOptions,
} from "@adeficior/data-modifier-core";
import type { ResolverOptions } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createTestDataResolver } from "@adeficior/testing";
import { afterEach, beforeAll } from "bun:test";
import { createDataModifier } from "../../src";

export async function setupInstance(
  version: string,
  {
    load = true,
    include,
    ...options
  }: Partial<PackLoaderOptions & Pick<ResolverOptions, "include">> & {
    load?: boolean;
  } = {},
) {
  const logger = createTestLogger();
  const instance = await createDataModifier({
    logger,
    packFormat: packFormatOf(version),
    ...options,
  });

  if (load) {
    beforeAll(async () => {
      const data = await createTestDataResolver(version, { include });
      instance.loadFrom(data);
    });
  }

  afterEach(() => {
    instance.reset();
  });

  return instance;
}
