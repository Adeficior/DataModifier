import type { Replacer } from "@adeficior/data-modifier-core/serializer";
import { mapValues } from "lodash-es";
import type { Ingredient } from "../../ingredient/impl";

export type IngredientMapInput = Record<string, unknown>;

const AUTO_KEYS = "abcdefghijklmnopqrstuvwxyz".split("");

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

    // TODO validate lines are all of equal size

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
