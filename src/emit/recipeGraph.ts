import { simpleResolver, type BaseContext } from "@adeficior/pack-resolver";
import type { ClearableEmitter } from ".";
import {
  resolveIDTest,
  type CommonFilter,
  type Predicate,
} from "../common/filters";
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
import { type TagRegistryHolder } from "../loader/tags";
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

export interface RecipeGraphOptions {
  // output: "visjs"
  keepTags?: boolean;
}

export interface RecipeGraphAccessor {
  represent(
    type: CommonFilter<NormalizedId<RecipeSerializerId>>,
    icon: IdInput<ItemId>,
    label?: string,
  ): void;
  show(id: IdInput): void;
}

type RecipeTypeRepresentation = {
  test: Predicate<RecipeSerializerId>;
  icon: NormalizedId<ItemId>;
  label?: string;
};

export class RecipeGraphEmitter
  implements ClearableEmitter, RecipeGraphAccessor
{
  private readonly nodes = new Registry<Node>();
  private representations: RecipeTypeRepresentation[] = [];
  private edges: Edge[] = [];

  constructor(
    private readonly recipes: JsonLoader<RecipeHolder>,
    private readonly tags: TagRegistryHolder,
    private readonly options: RecipeGraphOptions = {},
  ) {
    this.represent(/minecraft:crafting_.+/, "minecraft:crafting_bench");
    this.represent(/.+:crafting_special_.+/, "minecraft:crafting_bench");
    this.represent("minecraft:smelting", "minecraft:furnace");
    this.represent("minecraft:smoking", "minecraft:smoker");
    this.represent("minecraft:blasting", "minecraft:blast_furnace");
    this.represent("minecraft:campfire_cooking", "minecraft:campfire");
    this.represent("minecraft:stonecutting", "minecraft:stonecutter");
    this.represent(/minecraft:smithing.+/, "minecraft:smithing_table");

    this.represent("create:crushing", "create:crushing_wheel");
    this.represent("create:milling", "create:crushing_wheel");
    this.represent("create:mixing", "create:mechanical_mixer");
    this.represent("create:splashing", "create:encased_fan");
    this.represent("create:compacting", "create:mechanical_press");
    this.represent("create:pressing", "create:mechanical_press");
    this.represent("create:cutting", "create:mechanical_saw");
    this.represent("create:deploying", "create:deployer");
    this.represent("create:emptying", "create:spout");
    this.represent("create:filling", "create:spout");
    this.represent("create:haunting", "create:encased_fan");
    this.represent("create:mechanical_crafting", "create:mechanical_crafter");
    this.represent("create:sandpaper_polishing", "create:sand_paper");

    this.represent("farmersdelight:cooking", "farmersdelight:cooking_pot");
    this.represent("farmersdelight:cutting", "farmersdelight:cutting_board");

    this.represent("clayworks:baking", "clayworks:kiln");

    this.represent("sliceanddice:cutting", "sliceanddice:slicer");
  }

  represent(
    type: CommonFilter<NormalizedId<RecipeSerializerId>>,
    icon: IdInput<ItemId>,
    label?: string,
  ) {
    this.representations.push({
      test: resolveIDTest(type),
      icon: encodeId(icon),
      label,
    });
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
    const representation = this.representations.find((it) =>
      it.test(recipe.serializerType),
    );

    if (representation) {
      this.nodes.set(id, {
        id,
        shape: "image",
        image: representation.icon,
        label: representation.label,
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
    this.representations = [];
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
