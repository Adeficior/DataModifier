import type { TestDataOptions } from "@adeficior/testing";
import { createTestDataResolver, setupLookup } from "@adeficior/testing";
import { beforeAll } from "bun:test";
import { TagsLoader } from "../loader";
import type { TagRegistries } from "../schema";

export function setupTagRegistry(
  version: string,
  options: TestDataOptions = {},
): TagRegistries {
  const lookup = setupLookup(version);
  const loader = new TagsLoader(lookup);

  beforeAll(async () => {
    const data = await createTestDataResolver(version, {
      ...options,
      include: ["data/*/tags/**/*.json"],
    });

    await data.extract(loader);
  });

  return loader;
}
