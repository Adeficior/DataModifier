import { encodeId } from "@adeficior/data-modifier-core";
import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import {
  BlockIngredient,
  type Ingredient,
  type Result,
} from "@adeficior/data-modifier-ingredients";
import {
  Recipe,
  type RecipeDefinition,
  type RecipeModifier,
  type RecipeParseContext,
  RecipeParser,
} from "@adeficior/data-modifier-recipes";
import { type BlockId } from "@adeficior/data-modifier/generated";

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

export class TreeExtractionRecipe extends Recipe {
  constructor(
    private readonly trunk: Ingredient,
    private readonly leaves: Ingredient,
    private readonly sapling: Ingredient,
    private readonly result: Result,
  ) {
    super();
  }

  getIngredients() {
    return [this.trunk, this.leaves];
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new TreeExtractionRecipe(
      modifier.ingredient(this.trunk),
      modifier.ingredient(this.leaves),
      modifier.ingredient(this.sapling),
      modifier.result(this.result),
    );
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
    context: RecipeParseContext,
  ): Partial<TreeExtractionRecipeDefinition> {
    return {
      result: context.results.serialize(this.result),
      trunk: this.serializeBlockStateIngredient(this.trunk),
      leaves: this.serializeBlockStateIngredient(this.leaves),
      sapling: this.serializeBlockIngredient(this.sapling),
    };
  }
}

export class TreeExtractionRecipeParser extends RecipeParser<
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
}
