import { defineModule } from "@adeficior/data-modifier-core";

export default defineModule({
  dependencies: {
    // TODO make optional or not needed at all
    "@adeficior/data-modifier-tags": "required",
    "@adeficior/data-modifier-recipes": "required",
    "@adeficior/data-modifier-loot": "required",
  },
});
