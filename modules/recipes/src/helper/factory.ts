import type { IdInput, NormalizedId } from "@adeficior/data-modifier-core";

type RecipeFactory<Args extends unknown[]> = (
  id: IdInput | null,
  ...args: Args
) => NormalizedId;

interface CurriedRecipeFactory<Args extends unknown[]> {
  (id: IdInput, ...args: Args): NormalizedId;
  (...args: Args): NormalizedId;
}

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
