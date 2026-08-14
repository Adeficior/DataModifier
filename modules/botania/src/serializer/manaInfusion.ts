import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
} from "@adeficior/data-modifier-recipes";
import { Recipe, RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import { notNull } from "@adeficior/pack-resolver";
import { ingredientSerializerModules } from "./module";

export type ManaInfusionRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
    catalyst?: unknown;
    mana?: number;
  }>;

export class ManaInfusionRecipe extends Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly result: Result,
    readonly catalyst?: Ingredient,
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
}

export class ManaInfusionRecipeSerializer extends RecipeTypeSerializer<
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

  override serialize(
    recipe: ManaInfusionRecipe,
    context: RecipeParseContext,
  ): Partial<ManaInfusionRecipeDefinition> {
    return {
      input: context.ingredients.serialize(recipe.ingredient),
      output: context.results.serialize(recipe.result),
      catalyst: context.ingredients.serializeOptional(recipe.catalyst),
    };
  }
}
