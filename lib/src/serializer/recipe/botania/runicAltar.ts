import RecipeSerializer, { type RecipeParseContext } from "..";
import type { RecipeDefinition } from "../../../schema/data/recipe";
import { ManyToOneRecipe } from "../manyToOne";

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

export class RunicAltarRecipeParser extends RecipeSerializer<
  RunicAltarRecipeDefinition,
  RunicAltarRecipe
> {
  deserialize(
    definition: RunicAltarRecipeDefinition,
    context: RecipeParseContext,
  ): RunicAltarRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.output);
    return new RunicAltarRecipe(ingredients, result);
  }
}
