import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type {
  RecipeHolder,
  RecipeModifier,
  RecipeParseContext,
} from "../index.js";
import RecipeParser, { Recipe } from "../index.js";

export type GogWrapperRecipeDefinition = RecipeDefinition &
  Readonly<{
    nbt: string;
    base: RecipeDefinition;
    gog: RecipeDefinition;
  }>;

export class GogWrapperRecipe extends Recipe {
  constructor(
    private readonly base: RecipeHolder,
    private readonly gog: RecipeHolder,
  ) {
    super();
  }

  getIngredients() {
    return [...this.base.getIngredients(), ...this.gog.getIngredients()];
  }

  getResults() {
    return [...this.base.getResults(), ...this.gog.getResults()];
  }

  override modify(modifier: RecipeModifier) {
    return new GogWrapperRecipe(
      this.base.modify(modifier),
      this.gog.modify(modifier),
    );
  }

  override serialize(
    context: RecipeParseContext,
  ): Partial<GogWrapperRecipeDefinition> {
    return {
      base: context.recipes.serialize(this.base),
      gog: context.recipes.serialize(this.gog),
    };
  }
}

export class GogWrapperRecipeParser extends RecipeParser<
  GogWrapperRecipeDefinition,
  GogWrapperRecipe
> {
  deserialize(
    definition: GogWrapperRecipeDefinition,
    context: RecipeParseContext,
  ): GogWrapperRecipe {
    const base = context.recipes.deserialize(definition.base);
    const gog = context.recipes.deserialize(definition.gog);
    return new GogWrapperRecipe(base, gog);
  }
}
