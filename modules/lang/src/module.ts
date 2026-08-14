import { defineModule, jsonFilePattern } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { LangEmitter, type LangRules } from "./emitter";
import { LangLoader, type LangRegistry } from "./loader";

export default defineModule<{
  loaders: {
    lang: LangRegistry;
  };
  emitters: {
    lang: LangRules;
  };
}>({
  importModule: name,
  types: {
    loaders: {
      lang: "LangRegistry",
    },
    emitters: {
      lang: "LangRules",
    },
  },
  setup: (pack) => {
    const loader = pack.loader(
      "lang",
      () => new LangLoader(),
      jsonFilePattern("assets", "lang"),
    );
    pack.emitter("lang", () => new LangEmitter(loader()));
  },
});
