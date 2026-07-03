import type { BlockId } from "@adeficior/data-modifier/generated";
import { encodeId } from "../../../common/id.js";
import {
  BlockIngredient,
  type Ingredient,
} from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import { IllegalShapeError } from "../../../error.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import RecipeParser, {
  Recipe,
  type RecipeModifier,
  type RecipeParseContext,
} from "../index.js";

export type TreeExtractionRecipeDefinition = RecipeDefinition &
  Readonly<{
    leaves: BlockId;
    trunk: BlockId;
    result: unknown;
  }>;

export class TreeExtractionRecipe extends Recipe {
  constructor(
    private readonly trunk: Ingredient,
    private readonly leaves: Ingredient,
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

  override replace(modifier: RecipeModifier) {
    return new TreeExtractionRecipe(
      modifier.ingredient(this.trunk),
      modifier.ingredient(this.leaves),
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

  override serialize(
    context: RecipeParseContext,
  ): Partial<TreeExtractionRecipeDefinition> {
    return {
      result: context.results.serialize(this.result),
      trunk: this.serializeBlockIngredient(this.trunk),
      leaves: this.serializeBlockIngredient(this.leaves),
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
      new BlockIngredient(definition.trunk),
    );
    const leaves = context.ingredients.deserialize(
      new BlockIngredient(definition.leaves),
    );
    const result = context.results.deserialize(definition.result);
    return new TreeExtractionRecipe(trunk, leaves, result);
  }
}
