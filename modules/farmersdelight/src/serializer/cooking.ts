import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
} from "@adeficior/data-modifier-recipes";
import type {
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes/serializer";
import { notNull } from "@adeficior/pack-resolver";

type CookingOptions = Readonly<{
  cookingTime?: number;
  experience?: number;
  recipe_book_tab?: string;
}>;

export type CookingRecipeDefinition = RecipeDefinition &
  CookingOptions &
  Readonly<{
    ingredients: unknown[];
    container?: unknown;
    result: unknown;
  }>;

export class CookingRecipe implements Recipe {
  constructor(
    readonly ingredients: Ingredient[],
    readonly result: Result,
    readonly options: CookingOptions & { container?: Ingredient } = {},
  ) {}

  getIngredients() {
    return [this.options.container, ...this.ingredients].filter(notNull);
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new CookingRecipe(
      this.ingredients.map(modifier.ingredient),
      modifier.result(this.result),
      {
        ...this.options,
        container: modifier.optionalIngredient(this.options.container),
      },
    );
  }
}

export class CookingRecipeSerializer extends RecipeTypeSerializer<
  CookingRecipeDefinition,
  CookingRecipe
> {
  deserialize(
    definition: CookingRecipeDefinition,
    context: RecipeParseContext,
  ): CookingRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.result);
    const container = context.results
      .deserializeOptional(definition.container)
      ?.asIngredient();
    const { cookingTime, experience, recipe_book_tab } = definition;
    return new CookingRecipe(ingredients, result, {
      container,
      cookingTime,
      experience,
      recipe_book_tab,
    });
  }

  override serialize(
    recipe: CookingRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<CookingRecipeDefinition> {
    return {
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      result: context.results.serialize(recipe.result),
      container: context.results.serializeOptional(
        recipe.options.container?.asResult(),
      ),
      ...recipe.options,
    };
  }
}
