import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { TagEmitter } from "./emitter";
import { TagEmitterImpl } from "./emitter";
import type { TagEmitterOptions } from "./emitter/options";
import { TagsLoader } from "./loader";
import type { TagRegistries } from "./schema";

export default defineModule<{
  options: TagEmitterOptions;
  loaders: {
    tags: TagRegistries;
  };
  emitters: {
    tags: TagEmitter;
  };
}>({
  importModule: name,
  types: {
    options: "TagEmitterOptions",
    loaders: {
      tags: "TagRegistries",
    },
    emitters: {
      tags: "TagEmitter",
    },
  },
  promote: [{ key: "tags", service: "emitter:tags" }],
  setup: (instance) => {
    const loader = instance.loader(
      "tags",
      () => new TagsLoader(instance.options.packFormat),
      "data/*/tags/**/*.json",
    );

    instance.emitter(
      "tags",
      (container) =>
        new TagEmitterImpl(
          loader(),
          container.get("registries"),
          instance.options,
        ),
    );
  },
});
