import { notNull } from "@adeficior/pack-resolver";
import type { Ingredient, Result } from "../../../io";
import type { RecipeDefinition } from "../../../schema";
import { Recipe, RecipeParser } from "../abstract";
import type { RecipeParseContext } from "../context";
import type { RecipeModifier } from "../modifier";
import { ingredientSerializerModules } from "./blocks";

export type ManaInfusionRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
    catalyst?: unknown;
    mana?: number;
  }>;

export class ManaInfusionRecipe extends Recipe {
  constructor(
    private readonly ingredient: Ingredient,
    private readonly result: Result,
    private readonly catalyst?: Ingredient,
  ) {
    super();
  }

  getIngredients() {
    return [this.ingredient, this.catalyst].filter(notNull);
  }

  getResults() {
    return [this.result];
  }

  override modify(modifier: RecipeModifier) {
    return new ManaInfusionRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
      this.catalyst && modifier.ingredient(this.catalyst),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<ManaInfusionRecipeDefinition> {
    return {
      input: context.ingredients.serialize(this.ingredient),
      output: context.results.serialize(this.result),
      catalyst: context.ingredients.serializeOptional(this.catalyst),
    };
  }
}

export class ManaInfusionRecipeParser extends RecipeParser<
  ManaInfusionRecipeDefinition,
  ManaInfusionRecipe
> {
  override ingredientModules() {
    return ingredientSerializerModules;
  }

  deserialize(
    definition: ManaInfusionRecipeDefinition,
    context: RecipeParseContext,
  ): ManaInfusionRecipe {
    const catalyst = context.ingredients.deserializeOptional(
      definition.catalyst,
    );
    const ingredient = context.ingredients.deserialize(definition.input);
    const result = context.results.deserialize(definition.output);
    return new ManaInfusionRecipe(ingredient, result, catalyst);
  }
}
