import type { NormalizedId } from "@adeficior/data-modifier-core";
import { encodeId } from "@adeficior/data-modifier-core";
import type { Replacer } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

function keep<T>(): Replacer<T> {
  return (it) => it;
}

export class RecipeHolder {
  readonly serializerType: NormalizedId;

  constructor(
    private readonly definition: RecipeDefinition,
    private readonly recipe: Recipe,
  ) {
    this.serializerType = encodeId(definition.type);
  }

  serialize(context: RecipeParseContext) {
    const serializer = context.recipes.get(this.serializerType);
    return {
      ...this.definition,
      ...serializer.serialize(this.recipe, context),
    };
  }

  getIngredients() {
    return this.recipe.getIngredients();
  }

  getResults() {
    return this.recipe.getResults();
  }

  modify(modifier: RecipeModifier): RecipeHolder {
    const modified = this.recipe.modify(modifier);
    return new RecipeHolder(this.definition, modified);
  }

  replaceIngredient(replace: Replacer<Ingredient>): RecipeHolder {
    return this.modify({
      ingredient: replace,
      result: keep(),
    });
  }

  replaceResult(replace: Replacer<Result>): RecipeHolder {
    return this.modify({
      ingredient: keep(),
      result: replace,
    });
  }

  getTypes(): NormalizedId[] {
    return [this.serializerType, ...this.recipe.additionalTypes()];
  }
}
