import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import { RecipeTypeSerializer } from "@adeficior/data-modifier-recipes";
import type {
  Recipe,
  RecipeDefinition,
  RecipeModifier,
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";
import { notNull } from "@adeficior/pack-resolver";
import { ingredientSerializerModules } from "./module";

export type ManaInfusionRecipeDefinition = RecipeDefinition &
  Readonly<{
    input: unknown;
    output: unknown;
    catalyst?: unknown;
    mana?: number;
  }>;

export class ManaInfusionRecipe implements Recipe {
  constructor(
    readonly ingredient: Ingredient,
    readonly result: Result,
    readonly options: { mana?: number; catalyst?: Ingredient } = {},
  ) {}

  getIngredients() {
    return [this.ingredient, this.options.catalyst].filter(notNull);
  }

  getResults() {
    return [this.result];
  }

  modify(modifier: RecipeModifier) {
    return new ManaInfusionRecipe(
      modifier.ingredient(this.ingredient),
      modifier.result(this.result),
      {
        ...this.options,
        catalyst: modifier.optionalIngredient(this.options.catalyst),
      },
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
    return new ManaInfusionRecipe(ingredient, result, { catalyst });
  }

  override serialize(
    recipe: ManaInfusionRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<ManaInfusionRecipeDefinition> {
    return {
      input: context.ingredients.serialize(recipe.ingredient),
      output: context.results.serialize(recipe.result),
      catalyst: context.ingredients.serializeOptional(recipe.options.catalyst),
      mana: recipe.options.mana,
    };
  }
}
