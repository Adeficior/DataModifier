import {
  combineResolvers,
  createCombinedResolver,
  createResolver,
  type Logger,
  type Resolver,
  type ResolverOptions,
} from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { exists } from "node:fs/promises";
import { join, resolve } from "node:path";

const resourcePath = join("test", "resources");
const resourcesDir = join(import.meta.dir, "..", "..", "..", resourcePath);

export async function createTestDataResolver(
  version: string,
  { from = "default", ...options }: Partial<ResolverOptions> = {},
): Promise<Resolver> {
  if (Array.isArray(from))
    throw new Error("only one resolver input supported for TestResolver");

  const shared = await createCombinedResolver({
    from: join(resourcesDir, version, from),
    logger: false,
    ...options,
  });

  const localPath = resolve(resourcePath, version, from);
  if (await exists(localPath)) {
    const local = await createCombinedResolver({
      from: localPath,
      logger: false,
      ...options,
    });

    return combineResolvers([shared, local]);
  }

  return shared;
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
