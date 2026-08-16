import type {
  IngredientMap,
  IngredientMapInput,
  Result,
} from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "../../model";
import type { RecipeDefinition } from "../../schema";
import type { SerializedRecipe } from "../abstract";
import { RecipeTypeSerializer } from "../abstract";
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
    readonly pattern: string[],
    readonly ingredients: IngredientMap,
    readonly result: Result,
  ) {}

  getIngredients() {
    return this.ingredients.list();
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new ShapedRecipe(
      this.pattern,
      this.ingredients.replace(modifier.ingredient),
      modifier.result(this.result),
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
    return new ShapedRecipe(definition.pattern, ingredients, result);
  }

  override serialize(
    recipe: ShapedRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ShapedRecipeDefinition> {
    // TODO validate pattern?
    return {
      key: context.ingredients.serializeIngredientMap(recipe.ingredients),
      pattern: recipe.pattern,
      result: context.results.serialize(recipe.result),
    };
  }
}
