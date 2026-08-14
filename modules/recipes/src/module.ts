import { defineModule } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { RecipeEmitter } from "./emitter";
import { RecipeEmitterImpl } from "./emitter";
import type { RegisterRecipeSerializer } from "./hooks";
import type { RecipeLoader } from "./loader";
import { RecipeLoaderImpl } from "./loader";
import { recipePattern } from "./schema";
import type { RecipeSerializer } from "./serializer/abstract";
import { registerDefaultSerializers } from "./serializer/default";
import { RecipeSerializerImpl } from "./serializer/impl";

export default defineModule<{
  hooks: {
    "recipes:register-serializer": RegisterRecipeSerializer;
  };
  emitters: {
    recipes: RecipeEmitter;
  };
  loaders: {
    recipes: RecipeLoader;
  };
  services: {
    "serializer:recipes": RecipeSerializer;
  };
}>({
  importModule: name,
  dependencies: {
    "@adeficior/data-modifier-ingredients": "required",
  },
  types: {
    hooks: {
      "recipes:register-serializer": { name: "RegisterRecipeSerializer" },
    },
    loaders: {
      recipes: "RecipeLoader",
    },
    emitters: {
      recipes: "RecipeEmitter",
    },
    services: {
      "serializer:recipes": "RecipeSerializer",
    },
  },
  setup: (pack) => {
    const serializer = pack.service(
      "serializer:recipes",
      (container) =>
        new RecipeSerializerImpl(
          container.get("serializer:results"),
          container.get("serializer:ingredients"),
        ),
    );

    const loader = pack.loader(
      "recipes",
      () => new RecipeLoaderImpl(serializer()),
      recipePattern(pack.options.packFormat),
    );

    pack.emitter(
      "recipes",
      (container) =>
        new RecipeEmitterImpl(
          container.get("logger"),
          pack.options.packFormat,
          loader(),
          container.get("serializer:results"),
          container.get("serializer:ingredients"),
          container.get("predicates"),
          serializer(),
        ),
    );

    pack.hook("recipes:register-serializer", registerDefaultSerializers);

    pack.hook("setup:after", ({ callHook }) => {
      callHook("recipes:register-serializer", serializer().createEvent());
    });
  },
});
