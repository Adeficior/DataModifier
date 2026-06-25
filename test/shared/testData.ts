import {
  createResolver,
  type IResolver,
  type Options,
} from "@adeficior/pack-resolver";
import { createTestResolver } from "@adeficior/pack-resolver/testing";
import { join } from "node:path";

export function createTestDataResolver(
  version: string,
  { from, ...options }: Partial<Options> = {},
): IResolver {
  if (Array.isArray(from))
    throw new Error("only one resolver input supported for TestResolver");

  return createTestResolver(join(version, from ?? "default"), {
    include: ["assets/**/*.json", "data/**/*.json"],
    ...options,
  });
}

export function createDumpResolver(version: string): IResolver {
  return createResolver({
    from: join("test", "resources", version, "dump"),
    logger: false,
  });
}
