import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { TagEmitter, type TagRules } from "./emitter";
import { TagsLoader } from "./loader";
import { type TagRegistryHolder } from "./schema";

export default defineModule<{
  loaders: {
    tags: TagRegistryHolder;
  };
  emitters: {
    tags: TagRules;
  };
}>({
  importModule: name,
  types: {
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

    // TODO pass actual options
    pack.emitter("tags", () => new TagEmitter(loader(), {}));
  },
});
