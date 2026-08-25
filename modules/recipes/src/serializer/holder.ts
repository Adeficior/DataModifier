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

type CommonRecipeHolder = {
  serialize(context: RecipeParseContext): RecipeDefinition;
  getIngredients(): Ingredient[];
  getResults(): Result[];
  modify(modifier: RecipeModifier): RecipeHolder;
  replaceIngredient(replace: Replacer<Ingredient>): RecipeHolder;
  replaceResult(replace: Replacer<Result>): RecipeHolder;
  getTypes(): NormalizedId[];
};

export class RecipeHolder implements CommonRecipeHolder {
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

class FakeRecipeHolder implements CommonRecipeHolder {
  constructor(private readonly definition: RecipeDefinition) {}

  getIngredients(): Ingredient[] {
    return [];
  }

  getResults(): Result[] {
    return [];
  }

  getTypes(): NormalizedId[] {
    return [encodeId(this.definition.type)];
  }

  cast() {
    return this as unknown as RecipeHolder;
  }

  modify(): RecipeHolder {
    return this.cast();
  }

  replaceIngredient(): RecipeHolder {
    return this.cast();
  }

  replaceResult(): RecipeHolder {
    return this.cast();
  }

  serialize(): RecipeDefinition {
    return this.definition;
  }
}

export function isFakeHolder(holder: unknown) {
  return holder instanceof FakeRecipeHolder;
}

export function createFakeHolder(definition: RecipeDefinition): RecipeHolder {
  const fake = new FakeRecipeHolder(definition);
  return fake.cast();
}
