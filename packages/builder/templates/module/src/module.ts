import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";

export default defineModule({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  setup: (pack) => {
    pack.hook("recipes:register-serializer", (event) => {
      // TODO register parsers
    });
  },
});
