import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { LootEmitter } from "./emitter";
import { LootEmitterImpl } from "./emitter";
import { lootTableFolder, lootTablePattern } from "./helper";
import { LootTableLoader } from "./loader";
import { LootTableRulesImpl } from "./rule";
import type { LootTableRules } from "./rule";

export default defineModule<{
  loaders: {
    loot: LootTableLoader;
  };
  emitters: {
    loot: LootEmitter;
  };
  services: {
    "rules:loot": LootTableRules;
  };
}>({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-ingredients": "required",
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
    services: {
      "rules:loot": "LootTableRules",
    },
  },
  promote: [{ key: "loot", service: "emitter:loot" }],
  setup(instance) {
    const loader = instance.loader(
      "loot",
      () => new LootTableLoader(lootTableFolder(instance.options.packFormat)),
      lootTablePattern(instance.options.packFormat),
    );

    const rules = instance.service(
      "rules:loot",
      (container) => new LootTableRulesImpl(container.get("predicates")),
    );

    instance.emitter(
      "loot",
      (container) =>
        new LootEmitterImpl(
          instance.options.packFormat,
          loader(),
          container.get("registries"),
          container.get("predicates"),
          rules(),
        ),
    );
  },
});
