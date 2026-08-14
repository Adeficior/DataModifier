import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { LootTableEmitter } from "./emitter";
import type { LootRules } from "./emitter";
import { lootTablePattern } from "./helper";
import { LootTableLoader } from "./loader";

export default defineModule<{
  loaders: {
    loot: LootTableLoader;
  };
  emitters: {
    loot: LootRules;
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
      loot: "LootRules",
    },
  },
  setup(pack) {
    const loader = pack.loader(
      "loot",
      () => new LootTableLoader(),
      lootTablePattern(pack.options.packFormat),
    );

    pack.emitter(
      "loot",
      (container) =>
        new LootTableEmitter(
          pack.options.packFormat,
          loader(),
          container.get("registries"),
          container.get("predicates"),
        ),
    );
  },
});
