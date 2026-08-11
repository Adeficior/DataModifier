import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { ModelEmitter, type ModelRules } from "./emitter/models";

export default defineModule<{
  emitters: {
    "models:block": ModelRules;
    "models:item": ModelRules;
  };
}>({
  importModule: name,
  types: {
    emitters: {
      "models:block": "ModelRules",
      "models:item": "ModelRules",
    },
  },
  setup: (pack) => {
    pack.emitter("models:block", () => new ModelEmitter("block"));
    pack.emitter("models:item", () => new ModelEmitter("item"));
  },
});
