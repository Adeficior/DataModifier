import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type {
  RecipeParseContext,
  SerializedRecipe,
} from "@adeficior/data-modifier-recipes";
import {
  OneToOneRecipe,
  RecipeTypeSerializer,
} from "@adeficior/data-modifier-recipes";
import type { BotaniaBlockRecipeDefinition } from "./blocks";
import { BotaniaBlockRecipeSerializer } from "./blocks";

type OrechidOptions = Readonly<{
  biome_bonus?: number;
  biome_bonus_tag?: string;
  weight?: number;
}>;

export type OrechidRecipeDefinition = BotaniaBlockRecipeDefinition &
  OrechidOptions;

export class OrechidRecipe extends OneToOneRecipe {
  constructor(
    ingredient: Ingredient,
    result: Result,
    readonly options: OrechidOptions = {},
  ) {
    super(ingredient, result);
  }
}

export class OrechidRecipeSerializer extends RecipeTypeSerializer<
  OrechidRecipeDefinition,
  OrechidRecipe
> {
  private inner = new BotaniaBlockRecipeSerializer();

  override deserialize(
    definition: OrechidRecipeDefinition,
    context: RecipeParseContext,
  ) {
    const base = this.inner.deserialize(definition, context);
    return new OrechidRecipe(base.ingredient, base.result, {
      biome_bonus: definition.biome_bonus,
      biome_bonus_tag: definition.biome_bonus_tag,
      weight: definition.weight,
    });
  }

  override serialize(
    recipe: OrechidRecipe,
    context: RecipeParseContext,
  ): SerializedRecipe<OrechidRecipeDefinition> {
    const base = this.inner.serialize(recipe, context);
    return {
      ...base,
      ...recipe.options,
    };
  }
}
