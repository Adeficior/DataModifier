import { defineModule, PatchedRegistry } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { LootEmitter } from "./emitter";
import { LootEmitterImpl } from "./emitter";
import { lootTableFolder, lootTablePattern } from "./helper";
import { LootTableLoader } from "./loader";
import type { LootTableRegistry } from "./registry";
import type { LootTableRules } from "./rule";
import { LootTableRulesImpl } from "./rule";

export default defineModule<{
  loaders: {
    loot: LootTableLoader;
  };
  emitters: {
    loot: LootEmitter;
  };
  services: {
    "rules:loot": LootTableRules;
    "registry:loot": LootTableRegistry;
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
      "registry:loot": "LootTableRegistry",
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

    const registry = instance.service(
      "registry:loot",
      () => new PatchedRegistry(loader()),
    );

    instance.emitter(
      "loot",
      (container) =>
        new LootEmitterImpl(
          instance.options.packFormat,
          registry(),
          container.get("logger"),
          container.get("registries"),
          container.get("predicates"),
          rules(),
        ),
    );
  },
});
