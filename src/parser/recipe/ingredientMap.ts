import { mapValues } from "lodash-es";
import type { RecipeParseContext, Replacer } from ".";
import type { Ingredient } from "../../common/ingredient";

export type IngredientMapInput = Record<string, unknown>;

export class IngredientMap {
  constructor(private readonly ingredients: Record<string, Ingredient>) {}

  list(): Ingredient[] {
    return Object.values(this.ingredients);
  }

  replace(replace: Replacer<Ingredient>) {
    return new IngredientMap(mapValues(this.ingredients, replace));
  }

  serialize(context: RecipeParseContext) {
    return mapValues(this.ingredients, (it) =>
      context.ingredients.serialize(it),
    );
  }
}
