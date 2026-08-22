import type {
  IngredientSerializer,
  ResultSerializer,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeEmitter } from "@adeficior/data-modifier-recipes";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FarmersDelightRecipeHelper = {};

export class FarmersDelightRecipeHelperImpl implements FarmersDelightRecipeHelper {
  constructor(
    private readonly emitter: RecipeEmitter,
    private readonly ingredients: IngredientSerializer,
    private readonly results: ResultSerializer,
  ) {}
}
