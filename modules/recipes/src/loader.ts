import type {
  ConditionContext,
  RegistryProvider,
} from "@adeficior/data-modifier-core";
import { JsonLoader } from "@adeficior/data-modifier-core";
import { omit } from "lodash-es";
import { minimatch } from "minimatch";
import type { RecipeDefinition } from "./schema";
import type { RecipesSerializer } from "./serializer/abstract";
import type { RecipeHolder } from "./serializer/holder";

export interface RecipeLoader extends RegistryProvider<RecipeHolder> {
  ignoreType(pattern: string): void;
}

export class RecipeLoaderImpl
  extends JsonLoader<RecipeHolder>
  implements RecipeLoader
{
  private readonly ignoredRecipeTypePatterns: string[] = [];

  constructor(
    private readonly serializer: RecipesSerializer,
    context?: ConditionContext,
  ) {
    super(context);

    this.ignoreType("jeed:*");
  }

  ignoreType(pattern: string) {
    this.ignoredRecipeTypePatterns.push(pattern);
  }

  override parse(definition: RecipeDefinition): RecipeHolder | null {
    if (
      this.ignoredRecipeTypePatterns.some((it) =>
        minimatch(definition.type, it),
      )
    ) {
      return null;
    }

    const importantData = omit(
      definition,
      "type",
      "category",
      "conditions",
      "fabric:load_conditions",
      "neoforge:conditions",
    );

    if (Object.keys(importantData).length === 0) return null;

    return this.serializer.deserialize(definition);
  }
}
