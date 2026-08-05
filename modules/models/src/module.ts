import { defineModule } from "@adeficior/data-modifier-core";
import { ModelEmitter } from "./emitter/models";

export default defineModule({
  setupEmitters: ({ register }) => {
    register("models:block", new ModelEmitter("block"));
    register("models:item", new ModelEmitter("item"));
  },
});
