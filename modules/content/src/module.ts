import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { BlockDefinitionEmitter } from "./emitter/blockDefinition";
import { BlockDefinitionEmitterImpl } from "./emitter/blockDefinition";
import type { ItemDefinitionEmitter } from "./emitter/itemDefinition";
import { ItemDefinitionEmitterImpl } from "./emitter/itemDefinition";

export default defineModule<{
  emitters: {
    "content:blocks": BlockDefinitionEmitter;
    "content:items": ItemDefinitionEmitter;
  };
}>({
  importModule: name,
  dependencies: {
    // TODO optional?
    "@adeficior/data-modifier-loot": "required",
    "@adeficior/data-modifier-models": "required",
  },
  types: {
    emitters: {
      "content:blocks": "BlockDefinitionEmitter",
      "content:items": "ItemDefinitionEmitter",
    },
  },
  promote: [
    { key: "content.blocks", service: "emitter:content:blocks" },
    { key: "content.items", service: "emitter:content:items" },
  ],
  setup: (pack) => {
    pack.emitter(
      "content:blocks",
      (container) =>
        new BlockDefinitionEmitterImpl(
          container.get("emitter:models:block"),
          container.get("emitter:blockstates"),
          container.get("emitter:loot"),
        ),
    );

    pack.emitter(
      "content:items",
      (container) =>
        new ItemDefinitionEmitterImpl(
          container.get("emitter:models:item"),
          container.get("emitter:models:block"),
          container.get("emitter:blockstates"),
          container.get("emitter:loot"),
        ),
    );
  },
});
