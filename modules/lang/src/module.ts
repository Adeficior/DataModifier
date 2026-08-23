import { defineModule, jsonFilePattern } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { LangEmitter } from "./emitter";
import { LangEmitterImpl } from "./emitter";
import type { LangLoader } from "./loader";
import { LangLoaderImpl } from "./loader";

export default defineModule<{
  loaders: {
    lang: LangLoader;
  };
  emitters: {
    lang: LangEmitter;
  };
}>({
  importModule: name,
  types: {
    loaders: {
      lang: "LangLoader",
    },
    emitters: {
      lang: "LangEmitter",
    },
  },
  promote: [{ key: "lang", service: "emitter:lang" }],
  setup: (pack) => {
    const loader = pack.loader(
      "lang",
      () => new LangLoaderImpl(),
      jsonFilePattern("assets", "lang"),
    );
    pack.emitter("lang", () => new LangEmitterImpl(loader()));
  },
});
