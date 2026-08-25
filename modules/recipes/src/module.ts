import { defineModule, PatchedRegistry } from "@adeficior/data-modifier-core";
import { name } from "../package.json";
import type { RecipeEmitter } from "./emitter";
import { RecipeEmitterImpl } from "./emitter";
import type { VanillaRecipeHelper } from "./helper/vanilla";
import { VanillaRecipeHelperImpl } from "./helper/vanilla";
import type { RegisterRecipeSerializer } from "./hooks";
import type { RecipeLoader } from "./loader";
import { RecipeLoaderImpl } from "./loader";
import type { RecipeRegistry } from "./registry";
import type { RecipeRules } from "./rule";
import { RecipeRulesImpl } from "./rule";
import { recipeFolder, recipePattern } from "./schema";
import type { RecipesSerializer } from "./serializer/abstract";
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
    "serializer:recipes": RecipesSerializer;
    "rules:recipes": RecipeRules;
    "helper:recipes:vanilla": VanillaRecipeHelper;
    "registry:recipes": RecipeRegistry;
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
      "serializer:recipes": "RecipesSerializer",
      "rules:recipes": "RecipeRules",
      "helper:recipes:vanilla": "VanillaRecipeHelper",
      "registry:recipes": "RecipeRegistry",
    },
  },
  promote: [
    { service: "emitter:recipes", key: "recipes" },
    { service: "helper:recipes:vanilla", key: "recipes.vanilla" },
  ],
  setup: (instance) => {
    const serializer = instance.service(
      "serializer:recipes",
      (container) =>
        new RecipeSerializerImpl(
          container.get("serializer:results"),
          container.get("serializer:ingredients"),
        ),
    );

    const loader = instance.loader(
      "recipes",
      () =>
        new RecipeLoaderImpl(
          serializer(),
          recipeFolder(instance.options.packFormat),
        ),
      recipePattern(instance.options.packFormat),
    );

    const rules = instance.service(
      "rules:recipes",
      (container) => new RecipeRulesImpl(container.get("predicates")),
    );

    const registry = instance.service(
      "registry:recipes",
      () => new PatchedRegistry(loader()),
    );

    const emitter = instance.emitter(
      "recipes",
      (container) =>
        new RecipeEmitterImpl(
          container.get("logger"),
          instance.options.packFormat,
          registry(),
          container.get("serializer:results"),
          container.get("serializer:ingredients"),
          container.get("predicates"),
          rules(),
          serializer(),
        ),
    );

    instance.service(
      "helper:recipes:vanilla",
      (container) =>
        new VanillaRecipeHelperImpl(
          emitter(),
          container.get("serializer:ingredients"),
          container.get("serializer:results"),
        ),
    );

    instance.hook("recipes:register-serializer", registerDefaultSerializers);

    instance.hook("setup:after", ({ callHook }) => {
      callHook("recipes:register-serializer", serializer().createEvent());
    });
  },
});
