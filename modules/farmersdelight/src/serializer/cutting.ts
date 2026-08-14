import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import {
  ManyToManyRecipe,
  RecipeParser,
} from "@adeficior/data-modifier-recipes";
import type {
  ManyToManyRecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { resultSerializerModules } from "./module";

export type CuttingRecipeDefinition = Omit<
  ManyToManyRecipeDefinition,
  "results"
> &
  Readonly<{
    tool: unknown;
    result: ManyToManyRecipeDefinition["results"];
  }>;

export class CuttingRecipe extends ManyToManyRecipe {
  constructor(
    ingredients: Ingredient[],
    results: Result[],
    private readonly tool: Ingredient,
  ) {
    super(ingredients, results);
  }

  override getIngredients() {
    return [...super.getIngredients(), this.tool];
  }

  override modify(modifier: RecipeModifier) {
    return new CuttingRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
      modifier.ingredient(this.tool),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<CuttingRecipeDefinition> {
    const { results, ...rest } = super.serialize(context);
    return {
      ...rest,
      result: results,
      tool: context.ingredients.serialize(this.tool),
    };
  }
}

export class CuttingRecipeParser extends RecipeParser<
  CuttingRecipeDefinition,
  CuttingRecipe
> {
  override resultModules() {
    return resultSerializerModules;
  }

  deserialize(
    definition: CuttingRecipeDefinition,
    context: RecipeParseContext,
  ): CuttingRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserializeList(definition.result);
    const tool = context.ingredients.deserialize(definition.tool);
    return new CuttingRecipe(ingredients, result, tool);
  }
}
