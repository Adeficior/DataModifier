import {
  createResolver,
  type IResolver,
  type Options,
} from "@adeficior/pack-resolver";
import { createTestResolver } from "@adeficior/pack-resolver/testing";

export function createTestDataResolver(
  options: Partial<Options> = {},
): IResolver {
  return createTestResolver("default", {
    include: ["assets/**/*.json", "data/**/*.json"],
    ...options,
  });
}

export function createDumpResolver(): IResolver {
  return createResolver({
    from: "test/resources/dump",
    logger: false,
  });
}
