import {
  createCombinedResolver,
  createResolver,
  type Resolver,
  type ResolverOptions,
} from "@adeficior/pack-resolver";
import { join } from "node:path";

export function createTestDataResolver(
  version: string,
  { from, ...options }: Partial<ResolverOptions> = {},
): Resolver {
  if (Array.isArray(from))
    throw new Error("only one resolver input supported for TestResolver");

  return createCombinedResolver({
    from: join("test", "resources", version, from ?? "default"),
    include: ["assets/**/*.json", "data/**/*.json"],
    logger: false,
    ...options,
  });
}

export function createDumpResolver(version: string): Resolver {
  return createResolver({
    from: join("test", "resources", version, "dump"),
    logger: false,
  });
}
