import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import {
  BlockDefinitionEmitter,
  type BlockDefinitionRules,
} from "./emitter/blockDefinition";
import {
  ItemDefinitionEmitter,
  type ItemDefinitionRules,
} from "./emitter/itemDefinition";

export default defineModule<{
  emitters: {
    "content:blocks": BlockDefinitionRules;
    "content:items": ItemDefinitionRules;
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
      "content:blocks": "BlockDefinitionRules",
      "content:items": "ItemDefinitionRules",
    },
  },
  setup: (pack) => {
    pack.emitter(
      "content:blocks",
      (container) =>
        new BlockDefinitionEmitter(
          container.get("emitter:models:block"),
          container.get("emitter:blockstates"),
          container.get("emitter:loot"),
        ),
    );

    pack.emitter(
      "content:items",
      (container) =>
        new ItemDefinitionEmitter(
          container.get("emitter:models:item"),
          container.get("emitter:models:block"),
          container.get("emitter:blockstates"),
          container.get("emitter:loot"),
        ),
    );
  },
});
