import {
  packFormatOf,
  type TagRegistryHolder,
} from "@adeficior/data-modifier-core";
import { createTestDataResolver } from "@adeficior/testing";
import { beforeAll } from "bun:test";
import { TagsLoader } from "../../../modules/tags/src/loader";

// TODO this is dirty, maybe create a mocked loader instead?
export function setupTagRegistry(version: string): TagRegistryHolder {
  const loader = new TagsLoader(packFormatOf(version));

  beforeAll(async () => {
    const data = await createTestDataResolver(version, {
      include: ["data/*/tags/**/*.json"],
    });

    data.extract(loader);
  });

  return loader;
}
