import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { notNull } from "@adeficior/pack-resolver";
import type { Recipe } from "../../model";
import type { RecipeDefinition } from "../../schema";
import type { SerializedRecipe } from "../abstract";
import { RecipeTypeSerializer } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeModifier } from "../modifier";

export type SmithingRecipeDefinition = RecipeDefinition &
  Readonly<{
    base: unknown;
    addition: unknown;
    result?: unknown;
    template?: unknown;
  }>;

export class SmithingRecipe implements Recipe {
  constructor(
    readonly base: Ingredient,
    readonly addition: Ingredient,
    readonly result: Result | undefined,
    readonly template: Ingredient | undefined,
  ) {}

  getIngredients() {
    return [this.base, this.addition, this.template].filter(notNull);
  }

  getResults() {
    return [this.result].filter(notNull);
  }

  modify(modifier: RecipeModifier) {
    return new SmithingRecipe(
      modifier.ingredient(this.base),
      modifier.ingredient(this.addition),
      modifier.optionalResult(this.result),
      modifier.optionalIngredient(this.template),
    );
  }
}

export class SmithingSerializer extends RecipeTypeSerializer<
  SmithingRecipeDefinition,
  SmithingRecipe
> {
  deserialize(
    definition: SmithingRecipeDefinition,
    context: RecipeParseContext,
  ): SmithingRecipe {
    const base = context.ingredients.deserialize(definition.base);
    const addition = context.ingredients.deserialize(definition.addition);
    const result = context.results.deserializeOptional(definition.result);
    const template = context.ingredients.deserializeOptional(
      definition.template,
    );
    return new SmithingRecipe(base, addition, result, template);
  }

  override serialize(
    recipe: SmithingRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<SmithingRecipeDefinition> {
    return {
      base: context.ingredients.serialize(recipe.base),
      addition: context.ingredients.serialize(recipe.addition),
      result: context.results.serializeOptional(recipe.result),
      template: context.ingredients.serializeOptional(recipe.template),
    };
  }
}
