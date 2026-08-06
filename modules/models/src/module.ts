import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { ModelEmitter } from "./emitter/models";

export default defineModule({
  importModule: name,
  setup: (pack) => {
    pack.emitter("models:block", () => new ModelEmitter("block"), {
      import: { name: "ModelRules" },
    });
    pack.emitter("models:item", () => new ModelEmitter("item"), {
      import: { name: "ModelRules" },
    });
  },
});
