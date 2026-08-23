import type {
  Conditions,
  IdInput,
  NormalizedId,
} from "@adeficior/data-modifier-core";
import { encodeId } from "@adeficior/data-modifier-core";
import type { Replacer } from "@adeficior/data-modifier-core/serializer";
import type { Ingredient, Result } from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import type { RecipeParseContext } from "./context";
import type { RecipeModifier } from "./modifier";

function keep<T>(): Replacer<T> {
  return (it) => it;
}

function optional<T>(replacer: Replacer<T>): Replacer<T | undefined> {
  return (value) => value && replacer(value);
}

export class RecipeHolder {
  readonly serializerType: NormalizedId;

  private constructor(
    private readonly definition: RecipeDefinition,
    readonly recipe: Recipe,
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
      optionalIngredient: optional(replace),
      result: keep(),
      optionalResult: keep(),
    });
  }

  replaceResult(replace: Replacer<Result>): RecipeHolder {
    return this.modify({
      ingredient: keep(),
      optionalIngredient: keep(),
      result: replace,
      optionalResult: optional(replace),
    });
  }

  getTypes(): NormalizedId[] {
    const additional = this.recipe.additionalTypes?.() ?? [];
    return [this.serializerType, ...additional];
  }

  static of(
    type: IdInput<RecipeSerializerId>,
    recipe: Recipe,
    conditions?: Conditions,
  ): RecipeHolder {
    return new RecipeHolder({ type: encodeId(type), ...conditions }, recipe);
  }
}
