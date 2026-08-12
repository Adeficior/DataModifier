import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { BlockstateEmitter, type BlockstateRules } from "./emitter/blockstates";
import { ModelEmitter, type ModelRules } from "./emitter/models";

export default defineModule<{
  emitters: {
    "models:block": ModelRules;
    "models:item": ModelRules;
    blockstates: BlockstateRules;
  };
}>({
  importModule: name,
  types: {
    emitters: {
      "models:block": "ModelRules",
      "models:item": "ModelRules",
      blockstates: "BlockstateRules",
    },
  },
  setup: (pack) => {
    pack.emitter("models:block", () => new ModelEmitter("block"));
    pack.emitter("models:item", () => new ModelEmitter("item"));
    pack.emitter("blockstates", () => new BlockstateEmitter());
  },
});
