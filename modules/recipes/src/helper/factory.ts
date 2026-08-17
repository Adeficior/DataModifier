import {
  encodeId,
  type IdInput,
  type NormalizedId,
} from "@adeficior/data-modifier-core";

type RecipeFactory<Args extends unknown[]> = (
  id: IdInput,
  ...args: Args
) => void;

interface CurriedRecipeFactory<Args extends unknown[]> {
  (id: IdInput, ...args: Args): NormalizedId;
  (...args: Args): NormalizedId;
}

export function withDefaultId<Args extends unknown[]>(
  factory: RecipeFactory<Args>,
  defaultId: (...args: Args) => IdInput,
) {
  return ((...args: unknown[]) => {
    if (args.length < factory.length) {
      const rest = args as Args;
      const calculated = defaultId(...rest);
      factory(calculated, ...rest);
      return encodeId(calculated);
    } else {
      const id = encodeId(args[0] as IdInput);
      factory(...(args as [IdInput, ...Args]));
      return id;
    }
  }) as CurriedRecipeFactory<Args>;
}
