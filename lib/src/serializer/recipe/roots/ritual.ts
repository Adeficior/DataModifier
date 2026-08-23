import type { NormalizedId } from "@adeficior/data-modifier-core";
import { encodeId } from "@adeficior/data-modifier-core";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { RecipeModifier } from "@adeficior/data-modifier-recipes";
import type {
  ManyToOneRecipeDefinition,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import {
  ManyToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes/serializer";

type RitualOptions<I, E> = Readonly<{
  color: string;
  effect: E;
  level: number;
  incenses?: I[];
}>;

export type RootRitualRecipeDefinition = ManyToOneRecipeDefinition &
  RitualOptions<unknown, string>;

export class RootRitualRecipe extends ManyToOneRecipe {
  constructor(
    ingredients: Ingredient[],
    result: Result,
    readonly options: RitualOptions<Ingredient, NormalizedId>,
  ) {
    super(ingredients, result);
  }

  override getIngredients() {
    return [...super.getIngredients(), ...(this.options.incenses ?? [])];
  }

  override modify(modifier: RecipeModifier) {
    return new RootRitualRecipe(
      this.ingredients.map(modifier.ingredient),
      modifier.result(this.result),
      {
        ...this.options,
        incenses: this.options.incenses?.map(modifier.ingredient),
      },
    );
  }
}

export class RootRitualRecipeSerializer extends RecipeTypeSerializer<
  RootRitualRecipeDefinition,
  RootRitualRecipe
> {
  deserialize(
    definition: RootRitualRecipeDefinition,
    context: RecipeParseContext,
  ): RootRitualRecipe {
    const ingredients = context.ingredients.deserializeList(
      definition.ingredients,
    );
    const result = context.results.deserialize(definition.result);
    const incenses =
      definition.incenses &&
      context.ingredients.deserializeList(definition.incenses);
    return new RootRitualRecipe(ingredients, result, {
      incenses,
      color: definition.color,
      effect: encodeId(definition.effect),
      level: definition.level,
    });
  }

  override serialize(
    recipe: RootRitualRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<RootRitualRecipeDefinition> {
    return {
      result: context.results.serialize(recipe.result),
      ingredients: context.ingredients.serializeList(recipe.ingredients),
      ...recipe.options,
      incenses:
        recipe.options.incenses &&
        context.ingredients.serializeList(recipe.options.incenses),
    };
  }
}
