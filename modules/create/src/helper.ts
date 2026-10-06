import type { IdInput, NormalizedId } from "@adeficior/data-modifier-core";
import { createId, encodeId } from "@adeficior/data-modifier-core";
import type {
  IngredientInput,
  ResultInput,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeEmitter } from "@adeficior/data-modifier-recipes";
import type {
  ManyToManyHelper,
  ShapedHelper,
} from "@adeficior/data-modifier-recipes/helper";
import {
  AbstractRecipeHelper,
  createResultId,
  withDefaultId,
} from "@adeficior/data-modifier-recipes/helper";
import { RecipeHolder } from "@adeficior/data-modifier-recipes/serializer";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { AssembleRecipeOptions } from "./serializer/assembly";
import { AssemblyRecipe } from "./serializer/assembly";
import { ProcessingRecipe } from "./serializer/processing";

export type AssemblyBuilder = {
  deploying: ManyToManyHelper;
  filling: ManyToManyHelper;
  cutting: ManyToManyHelper;
  pressing: ManyToManyHelper;
};

type AssemblyFactory = (builder: AssemblyBuilder) => void;

export type CreateRecipeHelper = AssemblyBuilder & {
  mixing: ManyToManyHelper;
  compacting: ManyToManyHelper;
  emptying: ManyToManyHelper;
  crushing: ManyToManyHelper;
  milling: ManyToManyHelper;
  itemApplication: ManyToManyHelper;
  polishing: ManyToManyHelper;
  splashing: ManyToManyHelper;
  haunting: ManyToManyHelper;
  mechanicalCrafting: ShapedHelper;

  sequencedAssembly(
    id: IdInput,
    ingredient: IngredientInput,
    transitionalItem: IngredientInput,
    results: ResultInput[],
    sequence: AssemblyFactory,
    options?: AssembleRecipeOptions,
  ): NormalizedId;
  sequencedAssembly(
    ingredient: IngredientInput,
    transitionalItem: IngredientInput,
    results: ResultInput[],
    sequence: AssemblyFactory,
    options?: AssembleRecipeOptions,
  ): NormalizedId;
};

export class CreateRecipeHelperImpl
  extends AbstractRecipeHelper
  implements CreateRecipeHelper
{
  private processingHelper(
    type: IdInput<RecipeSerializerId>,
  ): ManyToManyHelper {
    return withDefaultId(
      (
        id: IdInput | null,
        ingredientsInput: IngredientInput[],
        resultsInput: ResultInput[],
      ) => {
        const ingredients = this.ingredients.deserializeList(ingredientsInput);
        const results = this.results.deserializeList(resultsInput);

        return this.emitter.add(
          id ?? createResultId(results, createId(type).path),
          type,
          new ProcessingRecipe(ingredients, results),
        );
      },
    );
  }

  readonly mixing = this.processingHelper("create:mixing");

  readonly pressing = this.processingHelper("create:pressing");

  readonly emptying = this.processingHelper("create:emptying");

  readonly crushing = this.processingHelper("create:crushing");

  readonly milling = this.processingHelper("create:milling");

  readonly compacting = this.processingHelper("create:compacting");

  readonly filling = this.processingHelper("create:filling");

  readonly cutting = this.processingHelper("create:cutting");

  readonly itemApplication = this.processingHelper("create:item_application");

  readonly polishing = this.processingHelper("create:sandpaper_polishing");

  readonly deploying = this.processingHelper("create:deploying");

  readonly splashing = this.processingHelper("create:splashing");

  readonly haunting = this.processingHelper("create:haunting");

  readonly mechanicalCrafting = this.shapedHelper("create:mechanical_crafting");

  readonly sequencedAssembly = withDefaultId(
    (
      id: IdInput | null,
      ingredientInput: IngredientInput,
      transitionalItemInput: IngredientInput,
      resultsInput: ResultInput[],
      sequenceFactory: AssemblyFactory,
      options: AssembleRecipeOptions = {},
    ) => {
      const ingredient = this.ingredients.deserialize(ingredientInput);
      const transitionalItem = this.ingredients.deserialize(
        transitionalItemInput,
      );
      const results = this.results.deserializeList(resultsInput);

      const sequence: RecipeHolder[] = [];

      const emitter = {
        add: (id, type, recipe) => {
          const holder = RecipeHolder.of(type, recipe);
          sequence.push(holder);
          return encodeId(id);
        },
      } as RecipeEmitter;

      const assemblyBuilder: AssemblyBuilder = new CreateRecipeHelperImpl(
        emitter,
        this.ingredients,
        this.results,
      );

      sequenceFactory(assemblyBuilder);

      return this.emitter.add(
        id ?? createResultId(results),
        "create:sequenced_assembly",
        new AssemblyRecipe(
          ingredient,
          transitionalItem,
          results,
          [...sequence],
          options,
        ),
      );
    },
  );
}
