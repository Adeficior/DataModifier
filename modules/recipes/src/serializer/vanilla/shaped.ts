import type {
  IngredientMap,
  IngredientMapInput,
  Result,
} from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "../../model";
import type { RecipeDefinition } from "../../schema";
import { RecipeTypeSerializer } from "../abstract";
import type { SerializedRecipe } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeModifier } from "../modifier";

export type ShapedRecipeDefinition = RecipeDefinition &
  Readonly<{
    key: IngredientMapInput;
    pattern: string[];
    result: unknown;
  }>;

export class ShapedRecipe implements Recipe {
  constructor(
    readonly ingredients: IngredientMap,
    readonly result: Result,
    readonly pattern: string[],
  ) {}

  getIngredients() {
    return this.ingredients.list();
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new ShapedRecipe(
      this.ingredients.replace(modifier.ingredient),
      modifier.result(this.result),
      this.pattern,
    );
  }
}

export class ShapedSerializer extends RecipeTypeSerializer<
  ShapedRecipeDefinition,
  ShapedRecipe
> {
  deserialize(
    definition: ShapedRecipeDefinition,
    context: RecipeParseContext,
  ): ShapedRecipe {
    const ingredients = context.ingredients.deserializeIngredientMap(
      definition.key,
    );
    const result = context.results.deserialize(definition.result);
    return new ShapedRecipe(ingredients, result, definition.pattern);
  }

  override serialize(
    recipe: ShapedRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ShapedRecipeDefinition> {
    return {
      key: context.ingredients.serializeIngredientMap(recipe.ingredients),
      pattern: recipe.pattern,
      result: context.results.serialize(recipe.result),
    };
  }
}
