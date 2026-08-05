import { defineModule } from "@adeficior/data-modifier-core";
import { TagEmitter } from "./emitter";
import { TagsLoader } from "./loader";

export default defineModule({
  setupLoaders: ({ register, options }) => {
    register("tags", new TagsLoader(options.packFormat));
  },
  setupEmitters: ({ register, get }) => {
    const loader = get("loader:tags");
    // TODO pass actual options
    register("tags", new TagEmitter(loader, {}));
  },
});
