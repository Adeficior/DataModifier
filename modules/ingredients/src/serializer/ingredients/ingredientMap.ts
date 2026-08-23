import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type { Replacer } from "@adeficior/data-modifier-core/serializer";
import { mapValues } from "lodash-es";
import type { Ingredient } from "../../ingredient/impl";

export type IngredientMapInput = Record<string, unknown>;

const AUTO_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function validatePatternDimensions<T>(pattern: T[][]) {
  if (pattern.length === 0) {
    throw new IllegalShapeError("ingredient pattern cannot be empty", pattern);
  }

  const width = pattern[0]!.length;
  if (pattern.some((it) => it.length !== width)) {
    throw new IllegalShapeError(
      "ingredient pattern rows must all be of same width",
      pattern,
    );
  }
}

export class IngredientMap {
  constructor(public readonly ingredients: Record<string, Ingredient>) {}

  list(): Ingredient[] {
    return Object.values(this.ingredients);
  }

  replace(replace: Replacer<Ingredient>) {
    return new IngredientMap(mapValues(this.ingredients, replace));
  }

  static from(ingredients: Ingredient[][]) {
    const pattern: string[] = [];
    const keys: Record<string, Ingredient> = {};
    const lookup = new Map<string, string>();

    validatePatternDimensions(ingredients);

    for (let y = 0; y < ingredients.length; y++) {
      const line = ingredients[y]!;
      let patternLine = "";
      for (let x = 0; x < line.length; x++) {
        const ingredient = line[x]!;
        const hash = ingredient.hashCode();
        const existing = lookup.get(hash);

        if (existing) {
          patternLine += existing;
        } else {
          const next = AUTO_KEYS[lookup.size];
          if (!next) {
            throw new Error(
              "ingredient map has to many ingredients to represent",
            );
          }

          patternLine += next;
          lookup.set(hash, next);
          keys[next] = ingredient;
        }
      }
      pattern.push(patternLine);
    }

    return { pattern, ingredients: new IngredientMap(keys) };
  }
}
