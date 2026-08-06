import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { TagEmitter } from "./emitter";
import { TagsLoader } from "./loader";

export default defineModule({
  importModule: name,
  setup: (pack) => {
    const loader = pack.loader(
      "tags",
      () => new TagsLoader(pack.options.packFormat),
      {
        import: {
          module: "@adeficior/data-modifier-core",
          name: "TagRegistryHolder",
        },
      },
    );

    // TODO pass actual options
    pack.emitter("tags", () => new TagEmitter(loader(), {}), {
      import: { name: "TagRules" },
    });
  },
});
