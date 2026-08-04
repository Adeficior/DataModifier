import { defineModule } from "@adeficior/data-modifier-core";
import { TagEmitter } from "./emitter";
import { type TagRegistryHolder, TagsLoader } from "./loader";

export default defineModule({
  setupLoaders: ({ register, options }) => {
    register("tags", new TagsLoader(options.packFormat));
  },
  setupEmitters: ({ register, options, get }) => {
    const loader = get<TagRegistryHolder>("loader:tags");
    // TODO pass actual options
    register("tags", new TagEmitter(loader, {}));
  },
});
