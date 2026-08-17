import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { BlockstateEmitter } from "./emitter/blockstates";
import { BlockstateEmitterImpl } from "./emitter/blockstates";
import type { ModelEmitter } from "./emitter/models";
import { ModelEmitterImpl } from "./emitter/models";

export default defineModule<{
  emitters: {
    "models:block": ModelEmitter;
    "models:item": ModelEmitter;
    blockstates: BlockstateEmitter;
  };
}>({
  importModule: name,
  types: {
    emitters: {
      "models:block": "ModelEmitter",
      "models:item": "ModelEmitter",
      blockstates: "BlockstateEmitter",
    },
    services: {
      "emitter:models": "ModelsService",
    },
  },
  promote: [
    { key: "models.block", service: "emitter:models:block" },
    { key: "models.item", service: "emitter:models:item" },
    { key: "blockstates", service: "emitter:blockstates" },
  ],
  setup: (pack) => {
    pack.emitter("models:block", () => new ModelEmitterImpl("block"));
    pack.emitter("models:item", () => new ModelEmitterImpl("item"));
    pack.emitter("blockstates", () => new BlockstateEmitterImpl());
  },
});
