import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { TagEmitter } from "./emitter";
import type { TagRules } from "./emitter";
import type { TagEmitterOptions } from "./emitter/options";
import { TagsLoader } from "./loader";
import type { TagRegistryHolder } from "./schema";

export default defineModule<{
  options: TagEmitterOptions;
  loaders: {
    tags: TagRegistryHolder;
  };
  emitters: {
    tags: TagRules;
  };
}>({
  importModule: name,
  types: {
    options: "TagEmitterOptions",
    loaders: {
      tags: "TagRegistryHolder",
    },
    emitters: {
      tags: "TagRules",
    },
  },
  setup: (pack) => {
    const loader = pack.loader(
      "tags",
      () => new TagsLoader(pack.options.packFormat),
      "data/*/tags/**/*.json",
    );

    pack.emitter("tags", () => new TagEmitter(loader(), pack.options));
  },
});
