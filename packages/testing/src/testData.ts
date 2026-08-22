import type {
  CombinedResolverOptions,
  Logger,
  Resolver,
} from "@adeficior/pack-resolver";
import {
  arrayOrSelf,
  combineResolvers,
  createCombinedResolver,
  createResolver,
} from "@adeficior/pack-resolver";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { join } from "node:path";

const resourcePath = join("test", "resources");
const sharedPath = join(import.meta.dir, "..", "..", "..", resourcePath);

export type TestDataOptions = Partial<CombinedResolverOptions>;

export async function createTestDataResolver(
  version: string,
  { from = "default", ...options }: TestDataOptions = {},
): Promise<Resolver> {
  const resolvers = await Promise.all(
    arrayOrSelf(from).map(async (it) =>
      createCombinedResolver({
        from: join(sharedPath, version, it),
        logger: false,
        ...options,
      }),
    ),
  );

  return combineResolvers(resolvers);
}

export function createDumpResolver(
  version: string,
  logger: Logger = createTestLogger(),
): Promise<Resolver> {
  return createResolver({
    from: join(sharedPath, version, "dump"),
    logger,
  });
}
