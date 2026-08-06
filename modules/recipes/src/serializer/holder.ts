import type {
  Ingredient,
  Replacer,
  Result,
} from "@adeficior/data-modifier-core";
import { encodeId, type NormalizedId } from "@adeficior/data-modifier-core";
import type { RecipeDefinition } from "../schema";
import type { Recipe } from "./abstract";
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
    return {
      ...this.definition,
      ...this.recipe.serialize(context),
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
