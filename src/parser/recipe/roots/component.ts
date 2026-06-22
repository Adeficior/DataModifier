import type { Ingredient } from "../../../common/ingredient/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeParseContext, Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type RootComponentRecipeDefinition = RecipeDefinition &
  Readonly<{
    effect: string;
    ingredients: unknown[];
  }>;

export class RootComponentRecipe extends Recipe {
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
    return new RootComponentRecipe(
      this.definition,
      this.ingredients.map(ingredientReplacer),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<RootComponentRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(this.ingredients),
    };
  }
}

export class RootComponentRecipeParser extends RecipeParser<
  RootComponentRecipeDefinition,
  RootComponentRecipe
> {
  deserialize(
    definition: RootComponentRecipeDefinition,
    context: RecipeParseContext,
  ): RootComponentRecipe {
    const ingredients = context.ingredients.createList(definition.ingredients);
    return new RootComponentRecipe(definition, ingredients);
  }
}
