import { defineModule } from "@adeficior/data-modifier-core";
import { mapValues } from "lodash-es";
import { name } from "../package.json";

const bundledModules: Record<string, string> = {
  "@adeficior/data-modifier-ingredients": "ingredients",
  "@adeficior/data-modifier-tags": "tags",
  "@adeficior/data-modifier-recipes": "recipes",
  "@adeficior/data-modifier-loot": "loot",
};

const bundled: Record<string, string | undefined> = {
  ...bundledModules,
  "@adeficior/data-modifier-core": undefined,
  "@adeficior/pack-resolver": undefined,
};

export default defineModule({
  name,
  dependencies: mapValues(bundledModules, () => "required"),
  types: {
    rewrite: (it) => {
      if (it.module in bundled) {
        return { ...it, module: name, path: bundled[it.module] };
      }
      return it;
    },
  },
});
