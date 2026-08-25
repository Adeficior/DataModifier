import type { IdInput } from "@adeficior/data-modifier-core";
import { encodeId } from "@adeficior/data-modifier-core";
import {
  IllegalShapeError,
  UnknownRegistryEntry,
} from "@adeficior/data-modifier-core/serializer";
import type {
  IngredientSerializer,
  ResultSerializer,
  WithSerializerModules,
} from "@adeficior/data-modifier-ingredients";
import type { RecipeSerializerId } from "@adeficior/data-modifier/generated";
import type { RegisterRecipeSerializer } from "../hooks";
import type { Recipe } from "../model";
import type { RecipeDefinition } from "../schema";
import type { RecipesSerializer, RecipeTypeSerializer } from "./abstract";
import type { RecipeParseContext } from "./context";
import { isFakeHolder, RecipeHolder } from "./holder";

export class RecipeSerializerImpl implements RecipesSerializer {
  private readonly typeSerializers = new Map<string, RecipeTypeSerializer>();

  constructor(
    private readonly resultSerializer: ResultSerializer,
    private readonly ingredientSerializer: IngredientSerializer,
  ) {}

  private recipeParseContext(
    parser: WithSerializerModules,
  ): RecipeParseContext {
    return {
      recipes: this,
      ingredients: this.ingredientSerializer.selectModule(
        parser.ingredientModules(),
      ),
      results: this.resultSerializer.selectModule(parser.resultModules()),
    };
  }

  get(type: IdInput<RecipeSerializerId>) {
    const id = encodeId(type);
    const parser = this.typeSerializers.get(id);
    if (parser) return parser;
    throw new UnknownRegistryEntry(
      `no serializer registered for ${id}`,
      "minecraft:recipe_serializer",
      id,
    );
  }

  serialize(
    holder: RecipeHolder | IdInput<RecipeSerializerId>,
    recipe?: Recipe,
  ): RecipeDefinition {
    if (isFakeHolder(holder)) {
      return holder.serialize();
    }

    if (holder instanceof RecipeHolder) {
      const parser = this.typeSerializers.get(holder.serializerType);

      if (!parser)
        throw new Error(
          `Unable to find parser for type '${holder.serializerType}'`,
        );

      const context = this.recipeParseContext(parser);
      return holder.serialize(context);
    } else {
      return this.serialize(RecipeHolder.of(holder, recipe!));
    }
  }

  deserialize(definition: RecipeDefinition): RecipeHolder {
    if (!definition.type)
      throw new IllegalShapeError(`no recipe type set`, definition);

    if (!("type" in definition))
      throw new IllegalShapeError("recipe type missing");

    let serializer: RecipeTypeSerializer;
    try {
      serializer = this.get(definition.type);
    } catch (cause) {
      if (cause instanceof UnknownRegistryEntry) {
        throw new IllegalShapeError(cause.message, definition, { cause });
      }
      throw cause;
    }

    const parsed = serializer.deserialize(
      definition,
      this.recipeParseContext(serializer),
    );

    return RecipeHolder.of(definition.type, parsed, definition);
  }

  createEvent(): RegisterRecipeSerializer {
    return {
      register: (type, parser) => {
        this.typeSerializers.set(type, parser);
      },
    };
  }
}
