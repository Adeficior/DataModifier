import { defineModifierConfig, packFormatOf } from "@adeficior/data-modifier";
import { resolve } from "node:path";

const version = "1.21.1";
const dump = resolve(
  import.meta.path,
  "..",
  "..",
  "..",
  "..",
  "test",
  "resources",
  version,
  "dump",
);

export default defineModifierConfig({
  packFormat: packFormatOf(version),
  dump,
  modules: [
    "@adeficior/data-modifier-botania",
    "@adeficior/data-modifier-create",
    "@adeficior/data-modifier-content",
    "@adeficior/data-modifier-farmersdelight",
    "@adeficior/data-modifier-models",
    "@adeficior/data-modifier-lang",
    "@adeficior/data-modifier-thermal",
  ],
});
