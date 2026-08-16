import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { RecipeModifier } from "@adeficior/data-modifier-recipes";
import type {
  ManyToManyRecipeDefinition,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes/serializer";
import {
  ManyToManyRecipe,
  ManyToManyRecipeSerializer,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes/serializer";

type ProcessingOptions = Readonly<{
  heatRequirement?: string;
  processingTime?: number;
  keepHeldItem?: boolean;
}>;

export type ProcessingRecipeDefinition = ManyToManyRecipeDefinition &
  ProcessingOptions;

export class ProcessingRecipe extends ManyToManyRecipe {
  constructor(
    ingredients: Ingredient[],
    results: Result[],
    readonly options: ProcessingOptions = {},
  ) {
    super(ingredients, results);
  }

  override modify(modifier: RecipeModifier) {
    return new ProcessingRecipe(
      this.ingredients.map(modifier.ingredient),
      this.results.map(modifier.result),
      this.options,
    );
  }
}

export class ProcessingRecipeSerializer extends RecipeTypeSerializer<
  ProcessingRecipeDefinition,
  ProcessingRecipe
> {
  private inner = new ManyToManyRecipeSerializer();

  override deserialize(
    definition: ProcessingRecipeDefinition,
    context: RecipeParseContext,
  ) {
    const base = this.inner.deserialize(definition, context);
    return new ProcessingRecipe(base.ingredients, base.results, {
      heatRequirement: definition.heatRequirement,
      keepHeldItem: definition.keepHeldItem,
      processingTime: definition.processingTime,
    });
  }

  override serialize(
    recipe: ProcessingRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ProcessingRecipeDefinition> {
    const base = this.inner.serialize(recipe, context);
    return {
      ...base,
      ...recipe.options,
    };
  }
}
