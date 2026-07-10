import { simpleResolver, type BaseContext } from "@adeficior/pack-resolver";
import type { ClearableEmitter } from ".";
import {
  createId,
  encodeId,
  prefix,
  type IdInput,
  type NormalizedId,
} from "../common/id";
import type { InputOutput } from "../common/inputOutput";
import Registry from "../common/registry";
import type { JsonLoader } from "../loader";
import type { RecipeHolder } from "../parser";
import type { ItemId, RecipeSerializerId } from "../stubTypes";
import { toJson } from "../textHelper";

type Node = {
  id: NormalizedId;
  shape?: string;
  image?: string;
  label?: string;
};

type Edge = {
  from: NormalizedId;
  to: NormalizedId;
  arrows?: string;
};

export interface RecipeGraphAccessor {
  represent(type: RecipeSerializerId, icon: IdInput<ItemId>): void;
  show(id: IdInput): void;
}

export class RecipeGraphEmitter
  implements ClearableEmitter, RecipeGraphAccessor
{
  private readonly nodes = new Registry<Node>();
  private readonly icons = new Registry<NormalizedId<ItemId>>();
  private edges: Edge[] = [];

  constructor(private readonly recipes: JsonLoader<RecipeHolder>) {}

  represent(type: RecipeSerializerId, icon: IdInput<ItemId>) {
    this.icons.set(type, encodeId(icon));
  }

  show(id: IdInput) {
    const recipe = this.recipes.get(id);

    if (!recipe)
      throw new Error(`cannot generate graph for unknown recipe '${id}'`);

    const recipeNodeId = prefix(id, "recipe/");
    this.addRecipeNode(recipeNodeId, recipe);
    recipe
      .getIngredients()
      .forEach((it) => this.addIONode(recipeNodeId, it, true));
    recipe
      .getResults()
      .forEach((it) => this.addIONode(recipeNodeId, it, false));
  }

  private addIONode(recipeId: NormalizedId, from: InputOutput, input: boolean) {
    // TODO just use first ID of whatever
    const [id] = [
      ...from.idsFor("minecraft:item"),
      ...from.idsFor("minecraft:fluid"),
      ...from.idsFor("minecraft:block"),
    ];
    if (!id) return;
    const { namespace, path } = createId(id);
    this.nodes.set(id, {
      id,
      shape: "image",
      image: `https://icons.macarena.ceo/icons/${namespace}/${path}.png`,
    });

    if (input) {
      this.edges.push({ from: recipeId, to: id, arrows: "to" });
    } else {
      this.edges.push({ from: id, to: recipeId, arrows: "to" });
    }
  }

  private addRecipeNode(id: NormalizedId, recipe: RecipeHolder) {
    const icon = this.icons.get(recipe.serializerType);
    if (icon) {
      this.nodes.set(id, {
        id,
        shape: "image",
        image: icon,
      });
    } else {
      this.nodes.set(id, {
        id,
        label: id,
      });
    }
  }

  clear(): void {
    this.nodes.clear();
    this.icons.clear();
    this.edges = [];
  }

  resolver(context: BaseContext) {
    return simpleResolver(async (acceptor) => {
      if (this.edges.length === 0) return;

      await Promise.all([
        acceptor("graph/nodes.json", toJson(this.nodes.values())),
        acceptor("graph/edges.json", toJson(this.edges)),
      ]);
    }, context);
  }
}
