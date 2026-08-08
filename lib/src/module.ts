import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";

export default defineModule({
  name,
  dependencies: {
    // TODO make optional or not needed at all
    "@adeficior/data-modifier-ingredients": "required",
    "@adeficior/data-modifier-tags": "required",
    "@adeficior/data-modifier-recipes": "required",
    "@adeficior/data-modifier-loot": "required",
  },
});
