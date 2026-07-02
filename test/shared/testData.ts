import {
  createCombinedResolver,
  createResolver,
  type Logger,
  type Resolver,
  type ResolverOptions,
} from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { join } from "node:path";

export function createTestDataResolver(
  version: string,
  { from, ...options }: Partial<ResolverOptions> = {},
): Resolver {
  if (Array.isArray(from))
    throw new Error("only one resolver input supported for TestResolver");

  return createCombinedResolver({
    from: join("test", "resources", version, from ?? "default"),
    logger: false,
    ...options,
  });
}

export function createDumpResolver(
  version: string,
  logger: Logger = createTestLogger(),
): Resolver {
  return createResolver({
    from: join("test", "resources", version, "dump"),
    logger,
  });
}
