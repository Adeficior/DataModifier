import { mapValues } from "lodash-es";
import type { Ingredient, Replacer } from "../io";

export type IngredientMapInput = Record<string, unknown>;

export class IngredientMap {
  constructor(public readonly ingredients: Record<string, Ingredient>) {}

  list(): Ingredient[] {
    return Object.values(this.ingredients);
  }

  replace(replace: Replacer<Ingredient>) {
    return new IngredientMap(mapValues(this.ingredients, replace));
  }
}
