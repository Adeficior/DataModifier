import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { LootEmitter } from "./emitter";
import { LootEmitterImpl } from "./emitter";
import { lootTablePattern } from "./helper";
import { LootTableLoader } from "./loader";

export default defineModule<{
  loaders: {
    loot: LootTableLoader;
  };
  emitters: {
    loot: LootEmitter;
  };
}>({
  importModule: name,
  dependencies: {
    // TODO make optional?
    "@adeficior/data-modifier-tags": "required",
  },
  types: {
    loaders: {
      loot: "LootTableLoader",
    },
    emitters: {
      loot: "LootEmitter",
    },
  },
  promote: [{ key: "loot", service: "emitter:loot" }],
  setup(pack) {
    const loader = pack.loader(
      "loot",
      () => new LootTableLoader(),
      lootTablePattern(pack.options.packFormat),
    );

    pack.emitter(
      "loot",
      (container) =>
        new LootEmitterImpl(
          pack.options.packFormat,
          loader(),
          container.get("registries"),
          container.get("predicates"),
        ),
    );
  },
});
