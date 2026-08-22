import { packFormatOf } from "@adeficior/data-modifier-core";
import { createTestDataResolver } from "@adeficior/testing";
import type { TestDataOptions } from "@adeficior/testing";
import { beforeAll } from "bun:test";
import { TagsLoader } from "../loader";
import type { TagRegistryHolder } from "../schema";

export function setupTagRegistry(
  version: string,
  options: TestDataOptions = {},
): TagRegistryHolder {
  const loader = new TagsLoader(packFormatOf(version));

  beforeAll(async () => {
    const data = await createTestDataResolver(version, {
      ...options,
      include: ["data/*/tags/**/*.json"],
    });

    await data.extract(loader);
  });

  return loader;
}
