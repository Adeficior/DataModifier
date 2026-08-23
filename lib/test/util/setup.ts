import type { DataModifierOptions } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import type { ResolverOptions } from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { createTestDataResolver } from "@adeficior/testing";
import { afterEach, beforeAll } from "bun:test";
import type { DataModifier, DataModifierFactory } from "../../src";
import { createDataModifier } from "../../src";

export async function setupInstance(
  version: string,
  {
    load = true,
    from,
    include,
    ...options
  }: Partial<
    DataModifierOptions & Pick<ResolverOptions, "include" | "from">
  > & {
    load?: boolean;
  } = {},
  factory?: DataModifierFactory,
): Promise<DataModifier> {
  const logger = createTestLogger();
  const instance = await createDataModifier(
    {
      logger,
      packFormat: packFormatOf(version),
      ...options,
    },
    factory,
  );

  if (load) {
    beforeAll(async () => {
      const data = await createTestDataResolver(version, { include, from });
      await instance.loadFrom(data);
    });
  }

  afterEach(() => {
    instance.reset();
  });

  return instance;
}
