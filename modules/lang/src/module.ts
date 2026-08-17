import { defineModule, jsonFilePattern } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { LangRules } from "./emitter";
import { LangEmitter } from "./emitter";
import type { LangRegistry } from "./loader";
import { LangLoader } from "./loader";

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
  promote: [{ key: "lang", service: "emitter:lang" }],
  setup: (pack) => {
    const loader = pack.loader(
      "lang",
      () => new LangLoader(),
      jsonFilePattern("assets", "lang"),
    );
    pack.emitter("lang", () => new LangEmitter(loader()));
  },
});
