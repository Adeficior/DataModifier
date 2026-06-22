import type { Ingredient } from "../../../common/ingredient/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type BrewRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredients: unknown[];
    brew: string;
  }>;

export class BrewRecipe extends Recipe {
  constructor(
    definition: RecipeDefinition,
    private readonly ingredients: Ingredient[],
  ) {
    super(definition);
  }

  getIngredients() {
    return this.ingredients;
  }

  getResults() {
    return [];
  }

  override replace(ingredientReplacer: Replacer<Ingredient>) {
    return new BrewRecipe(
      this.definition,
      this.ingredients.map(ingredientReplacer),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<BrewRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(this.ingredients),
    };
  }
}

export class BrewRecipeParser extends RecipeParser<
  BrewRecipeDefinition,
  BrewRecipe
> {
  deserialize(
    definition: BrewRecipeDefinition,
    context: RecipeParseContext,
  ): BrewRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    return new BrewRecipe(definition, ingredients);
  }
}
