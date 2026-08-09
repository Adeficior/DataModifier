import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { registerParsers } from "./registration";

export default defineModule({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-recipes": "required",
  },
  setup: (pack) => {
    pack.hook("recipes:register-parser", registerParsers);
  },
});
