import { exists } from "@adeficior/pack-resolver";
import type { Ingredient } from "../../../common/ingredient/index.js";
import type { Result } from "../../../common/result/index.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { RecipeModifier, RecipeParseContext } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import { deserializeBlockInput, serializeBlockInput } from "./blocks.js";

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
    return [this.ingredient, this.catalyst].filter(exists);
  }

  getResults() {
    return [this.result];
  }

  override replace(modifier: RecipeModifier) {
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
      catalyst: this.catalyst && serializeBlockInput(this.catalyst),
    };
  }
}

export class ManaInfusionRecipeParser extends RecipeParser<
  ManaInfusionRecipeDefinition,
  ManaInfusionRecipe
> {
  deserialize(
    definition: ManaInfusionRecipeDefinition,
    context: RecipeParseContext,
  ): ManaInfusionRecipe {
    const catalyst =
      definition.catalyst === undefined
        ? undefined
        : deserializeBlockInput(context.ingredients, definition.catalyst);
    const ingredient = context.ingredients.create(definition.input);
    const result = context.results.create(definition.output);
    return new ManaInfusionRecipe(ingredient, result, catalyst);
  }
}
