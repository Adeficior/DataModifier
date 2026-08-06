import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { LangEmitter } from "./emitter";
import { LangLoader } from "./loader";

export default defineModule({
  importModule: name,
  setup: (pack) => {
    const loader = pack.loader("lang", () => new LangLoader());
    pack.emitter("lang", () => new LangEmitter(loader()), {
      import: { name: "LangRules" },
    });
  },
});
