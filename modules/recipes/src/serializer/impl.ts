import { encodeId } from "@adeficior/data-modifier-core";
import { IllegalShapeError } from "@adeficior/data-modifier-core/serializer";
import type {
  IngredientSerializer,
  ResultSerializer,
  WithSerializerModules,
} from "@adeficior/data-modifier-ingredients";
import type { RegisterRecipeSerializer } from "../hooks";
import type { RecipeDefinition } from "../schema";
import type { RecipeSerializer, RecipeTypeSerializer } from "./abstract";
import type { RecipeParseContext } from "./context";
import { RecipeHolder } from "./holder";

export class RecipeSerializerImpl implements RecipeSerializer {
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

  serialize(recipe: RecipeHolder): RecipeDefinition {
    const parser = this.typeSerializers.get(recipe.serializerType);

    if (!parser)
      throw new Error(
        `Unable to find parser for type '${recipe.serializerType}'`,
      );

    const context = this.recipeParseContext(parser);
    return recipe.serialize(context);
  }

  deserialize(definition: RecipeDefinition): RecipeHolder {
    if (!definition.type)
      throw new IllegalShapeError(`no recipe type set`, definition);

    const parser = this.typeSerializers.get(encodeId(definition.type));

    if (!("type" in definition))
      throw new IllegalShapeError("recipe type missing");

    if (!parser) {
      throw new IllegalShapeError(
        `unknown recipe type: '${definition.type}'`,
        definition,
      );
    }

    const parsed = parser.deserialize(
      definition,
      this.recipeParseContext(parser),
    );

    return new RecipeHolder(definition, parsed);
  }

  createEvent(): RegisterRecipeSerializer {
    return {
      register: (type, parser) => {
        this.typeSerializers.set(type, parser);
      },
    };
  }
}
