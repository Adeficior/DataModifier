import type { IdInput, NormalizedId } from "@adeficior/data-modifier-core";
import type {
  IngredientInput,
  ResultInput,
} from "@adeficior/data-modifier-ingredients";

type RecipeFactory<Args extends unknown[]> = (
  id: IdInput | null,
  ...args: Args
) => NormalizedId;

type CurriedRecipeFactory<Args extends unknown[]> = {
  (id: IdInput, ...args: Args): NormalizedId;
  (...args: Args): NormalizedId;
};

export function withDefaultId<Args extends unknown[]>(
  factory: RecipeFactory<Args>,
) {
  return ((...args: unknown[]) => {
    if (args.length < factory.length) {
      const rest = args as Args;
      return factory(null, ...rest);
    } else {
      return factory(...(args as [IdInput, ...Args]));
    }
  }) as CurriedRecipeFactory<Args>;
}

export type ManyToManyHelper = {
  (ingredients: IngredientInput[], results: ResultInput[]): NormalizedId;
  (
    id: IdInput,
    ingredients: IngredientInput[],
    results: ResultInput[],
  ): NormalizedId;
};

export type ManyToOneHelper = {
  (ingredients: IngredientInput[], results: ResultInput): NormalizedId;
  (
    id: IdInput,
    ingredients: IngredientInput[],
    results: ResultInput,
  ): NormalizedId;
};

export type ShapedHelper = {
  (
    id: IdInput,
    ingredients: IngredientInput[][],
    result: ResultInput,
  ): NormalizedId;
  (ingredients: IngredientInput[][], result: ResultInput): NormalizedId;
};
