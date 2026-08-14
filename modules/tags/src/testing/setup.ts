import { packFormatOf } from "@adeficior/data-modifier-core";
import { createTestDataResolver } from "@adeficior/testing";
import { beforeAll } from "bun:test";
import { TagsLoader } from "../loader";
import type { TagRegistryHolder } from "../schema";

export function setupTagRegistry(version: string): TagRegistryHolder {
  const loader = new TagsLoader(packFormatOf(version));

  beforeAll(async () => {
    const data = await createTestDataResolver(version, {
      include: ["data/*/tags/**/*.json"],
    });

    await data.extract(loader);
  });

  return loader;
}
