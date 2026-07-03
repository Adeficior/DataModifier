import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import RecipeParser, { type RecipeParseContext } from "../index.js";
import { ManyToOneRecipe } from "../manyToOne.js";

export type RunicAltarRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    output: unknown;
    mana: number;
  }>;

export class RunicAltarRecipe extends ManyToOneRecipe {
  override serialize(
    context: RecipeParseContext,
  ): Partial<RunicAltarRecipeDefinition> {
    const { result, ...rest } = super.serialize(context);
    return { ...rest, output: result };
  }
}

export class RunicAltarRecipeParser extends RecipeParser<
  RunicAltarRecipeDefinition,
  RunicAltarRecipe
> {
  deserialize(
    definition: RunicAltarRecipeDefinition,
    context: RecipeParseContext,
  ): RunicAltarRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    const result = context.results.deserialize(definition.output);
    return new RunicAltarRecipe(ingredients, result);
  }
}
