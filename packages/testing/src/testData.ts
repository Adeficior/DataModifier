import {
  createCombinedResolver,
  createResolver,
  type Logger,
  type Resolver,
  type ResolverOptions,
} from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { join } from "node:path";

const resourcesDir = join(
  import.meta.dir,
  "..",
  "..",
  "..",
  "test",
  "resources",
);

export function createTestDataResolver(
  version: string,
  { from, ...options }: Partial<ResolverOptions> = {},
): Promise<Resolver> {
  if (Array.isArray(from))
    throw new Error("only one resolver input supported for TestResolver");

  return createCombinedResolver({
    from: join(resourcesDir, version, from ?? "default"),
    logger: false,
    ...options,
  });
}

export function createDumpResolver(
  version: string,
  logger: Logger = createTestLogger(),
): Promise<Resolver> {
  return createResolver({
    from: join(resourcesDir, version, "dump"),
    logger,
  });
}
