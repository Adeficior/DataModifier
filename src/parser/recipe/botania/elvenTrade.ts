import RecipeParser, { type RecipeParseContext } from "..";
import type { RecipeDefinition } from "../../../schema/data/recipe";
import { ManyToManyRecipe } from "../manyToMany";

export type ElvenTradeRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    output: unknown[];
    mana?: number;
  }>;

export class ElvenTradeRecipe extends ManyToManyRecipe {
  override serialize(
    context: RecipeParseContext,
  ): Partial<ElvenTradeRecipeDefinition> {
    const { results, ...rest } = super.serialize(context);
    return { ...rest, output: results };
  }
}

export class ElvenTradeRecipeParser extends RecipeParser<
  ElvenTradeRecipeDefinition,
  ElvenTradeRecipe
> {
  deserialize(
    definition: ElvenTradeRecipeDefinition,
    context: RecipeParseContext,
  ): ElvenTradeRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const results = context.results.deserializeList(definition.output);
    return new ElvenTradeRecipe(ingredients, results);
  }
}
