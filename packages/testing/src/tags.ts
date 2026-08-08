import { packFormatOf } from "@adeficior/data-modifier-core";
import { createTestDataResolver } from "@adeficior/testing";
import { beforeAll } from "bun:test";
import { type TagRegistryHolder } from "../../../modules/tags/src";
import { TagsLoader } from "../../../modules/tags/src/loader";

// TODO this is dirty, maybe create a mocked loader instead?
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
