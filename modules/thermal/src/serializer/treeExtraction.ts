import { encodeId } from "@adeficior/data-modifier-core";
import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { BlockIngredient } from "@adeficior/data-modifier-ingredients";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";
import type { BlockId } from "@adeficior/data-modifier/generated";

type BlockStateIngredient = {
  Name: BlockId;
  Properties?: Record<string, unknown>;
};

export type TreeExtractionRecipeDefinition = RecipeDefinition &
  Readonly<{
    leaves: BlockStateIngredient;
    trunk: BlockStateIngredient;
    sapling: BlockId;
    result: unknown;
  }>;

export class TreeExtractionRecipe implements Recipe {
  constructor(
    readonly trunk: Ingredient,
    readonly leaves: Ingredient,
    readonly sapling: Ingredient,
    readonly result: Result,
  ) {}

  getIngredients() {
    return [this.trunk, this.leaves];
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new TreeExtractionRecipe(
      modifier.ingredient(this.trunk),
      modifier.ingredient(this.leaves),
      modifier.ingredient(this.sapling),
      modifier.result(this.result),
    );
  }
}

export class TreeExtractionRecipeSerializer extends RecipeTypeSerializer<
  TreeExtractionRecipeDefinition,
  TreeExtractionRecipe
> {
  deserialize(
    definition: TreeExtractionRecipeDefinition,
    context: RecipeParseContext,
  ): TreeExtractionRecipe {
    const trunk = context.ingredients.deserialize(
      new BlockIngredient(definition.trunk.Name),
    );
    const leaves = context.ingredients.deserialize(
      new BlockIngredient(definition.leaves.Name),
    );
    const sapling = context.ingredients.deserialize(
      new BlockIngredient(definition.sapling),
    );
    const result = context.results.deserialize(definition.result);
    return new TreeExtractionRecipe(trunk, leaves, sapling, result);
  }

  private serializeBlockIngredient(ingredient: Ingredient) {
    if (ingredient instanceof BlockIngredient) {
      return encodeId(ingredient.id);
    }

    throw new IllegalShapeError(
      "tree extraction recipes ingredients need to be blocks",
      ingredient,
    );
  }

  private serializeBlockStateIngredient(ingredient: Ingredient) {
    if (ingredient instanceof BlockIngredient) {
      return {
        // TODO "Properties"
        Name: encodeId(ingredient.id),
      };
    }

    throw new IllegalShapeError(
      "tree extraction recipes ingredients need to be blocks",
      ingredient,
    );
  }

  override serialize(
    recipe: TreeExtractionRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<TreeExtractionRecipeDefinition> {
    return {
      result: context.results.serialize(recipe.result),
      trunk: this.serializeBlockStateIngredient(recipe.trunk),
      leaves: this.serializeBlockStateIngredient(recipe.leaves),
      sapling: this.serializeBlockIngredient(recipe.sapling),
    };
  }
}
