import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { RecipeEmitter } from "./emitter";
import type { RegisterRecipeParser } from "./hooks";
import { RecipeLoader } from "./loader";

export default defineModule<{
  hooks: {
    "recipes:register-parser": RegisterRecipeParser;
  };
}>({
  importModule: name,
  hooks: {
    "recipes:register-parser": { name: "RegisterRecipeParser" },
  },
  setup: (pack) => {
    const loader = pack.loader(
      "recipes",
      (container) =>
        new RecipeLoader(
          container.get("serializer:results"),
          container.get("serializer:ingredients"),
        ),
      { import: { name: "RecipeLoaderAccessor" } },
    );

    pack.emitter(
      "recipes",
      (container) =>
        new RecipeEmitter(
          container.get("logger"),
          pack.options.packFormat,
          loader(),
          container.get("serializer:results"),
          container.get("serializer:ingredients"),
          container.get("predicates"),
          loader(),
        ),
      { import: { name: "RecipeRules" } },
    );

    // TODO after everyting else (done event?)
    pack.callHook("recipes:register-parser", {
      register: (_type, _parser) => {
        // TODO register on loader
      },
    });
  },
});
