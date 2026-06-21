import type {
  Ingredient,
  IngredientInput,
} from "../../../common/ingredient.js";
import type { Result, ResultInput } from "../../../common/result.js";
import type { RecipeDefinition } from "../../../schema/data/recipe.js";
import type { Replacer } from "../index.js";
import RecipeParser, { Recipe } from "../index.js";
import type { CreateProcessingRecipeDefinition } from "./processing.js";
import { CreateProcessingRecipe } from "./processing.js";

export type AssemblyRecipeDefinition = RecipeDefinition &
  Readonly<{
    ingredient: Ingredient;
    transitionalItem: Ingredient;
    results: Result[];
    loops?: number;
    sequence: CreateProcessingRecipeDefinition[];
  }>;

export class AssemblyRecipe extends Recipe<AssemblyRecipeDefinition> {
  private readonly sequence: CreateProcessingRecipe[];

  constructor(
    protected override readonly definition: AssemblyRecipeDefinition,
  ) {
    super(definition);
    this.sequence = this.definition.sequence.map(
      (it) => new CreateProcessingRecipe(it),
    );
  }

  getIngredients(): IngredientInput[] {
    return [
      this.definition.ingredient,
      this.definition.transitionalItem,
      ...this.sequence.flatMap((it) => it.getIngredients()),
    ];
  }

  getResults(): ResultInput[] {
    return [
      ...this.definition.results,
      ...this.sequence.flatMap((it) => it.getResults()),
    ];
  }

  replaceIngredient(replace: Replacer<Ingredient>): Recipe {
    return new AssemblyRecipe({
      ...this.definition,
      ingredient: replace(this.definition.ingredient),
      transitionalItem: replace(this.definition.ingredient),
      sequence: this.sequence.map((it) =>
        it.replaceIngredient(replace).toJSON(),
      ),
    });
  }

  replaceResult(replace: Replacer<Result>): Recipe {
    return new AssemblyRecipe({
      ...this.definition,
      results: this.definition.results.map(replace),
      sequence: this.sequence.map((it) => it.replaceResult(replace).toJSON()),
    });
  }
}

export default class AssemblyRecipeParser extends RecipeParser<
  AssemblyRecipeDefinition,
  AssemblyRecipe
> {
  create(definition: AssemblyRecipeDefinition): AssemblyRecipe {
    return new AssemblyRecipe(definition);
  }
}
