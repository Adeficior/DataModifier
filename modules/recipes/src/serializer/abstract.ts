import type {
  Ingredient,
  Result,
  WithSerializerModules,
} from "@adeficior/data-modifier-core";
import { type NormalizedId } from "@adeficior/data-modifier-core";
import type { RecipeDefinition } from "../schema";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

export abstract class Recipe {
  abstract getIngredients(): Ingredient[];

  abstract getResults(): Result[];

  abstract modify(modifier: RecipeModifier): Recipe;

  additionalTypes(): NormalizedId[] {
    return [];
  }

  abstract serialize(context: RecipeParseContext): Partial<RecipeDefinition>;
}

export abstract class RecipeParser<
  TDefinition extends RecipeDefinition = RecipeDefinition,
  TRecipe extends Recipe = Recipe,
> implements WithSerializerModules {
  ingredientModules() {
    return {};
  }

  resultModules() {
    return {};
  }

  abstract deserialize(
    definition: TDefinition,
    context: RecipeParseContext,
  ): TRecipe;
}
