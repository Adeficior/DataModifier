import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import { RecipeEmitter, type RecipeRules } from "./emitter";
import { type RegisterRecipeParser } from "./hooks";
import { RecipeLoader, type RecipeLoaderAccessor } from "./loader";
import { recipePattern } from "./schema";

export default defineModule<{
  hooks: {
    "recipes:register-parser": RegisterRecipeParser;
  };
  emitters: {
    recipes: RecipeRules;
  };
  loaders: {
    recipes: RecipeLoaderAccessor;
  };
}>({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-ingredients": "required",
    // TODO make optional?
    "@adeficior/data-modifier-tags": "required",
  },
  types: {
    hooks: {
      "recipes:register-parser": { name: "RegisterRecipeParser" },
    },
    loaders: {
      recipes: "RecipeLoaderAccessor",
    },
    emitters: {
      recipes: "RecipeRules",
    },
  },
  setup: (pack) => {
    const loader = pack.loader(
      "recipes",
      (container) =>
        new RecipeLoader(
          container.get("serializer:results"),
          container.get("serializer:ingredients"),
        ),
      recipePattern(pack.options.packFormat),
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
    );

    pack.hook("setup:after", ({ callHook }) => {
      const serializer = loader();
      callHook("recipes:register-parser", {
        register: (type, parser) => {
          serializer.registerParser(type, parser);
        },
      });
    });
  },
});
