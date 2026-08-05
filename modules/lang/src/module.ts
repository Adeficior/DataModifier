import { defineModule } from "@adeficior/data-modifier-core";
import { LangEmitter } from "./emitter";
import { LangLoader } from "./loader";

export default defineModule({
  setupLoaders: ({ register }) => {
    register("lang", new LangLoader());
  },
  setupEmitters: ({ register, get }) => {
    const loader = get("loader:lang");
    register("lang", new LangEmitter(loader));
  },
});
