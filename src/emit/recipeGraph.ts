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
  suffix,
  type IdInput,
  type NormalizedId,
} from "../common/id";
import type { InputOutput } from "../common/inputOutput";
import Registry from "../common/registry";
import type { JsonLoader } from "../loader";
import { type TagRegistryHolder } from "../loader/tags";
import type { RecipeHolder } from "../parser";
import type { ItemId, RecipeSerializerId, RegistryId } from "../stubTypes";
import { toJson } from "../textHelper";

type Node = {
  id: NormalizedId;
  shape?: string;
  brokenImage?: string;
  image?: string;
  label?: string;
  registry: NormalizedId<RegistryId>;
};

type Edge = {
  from: NormalizedId;
  to: NormalizedId;
  arrows?: string;
  label?: string;
};

export interface RecipeGraphOptions {
  // output: "visjs"
  resolveTags?: boolean;
  brokenIcon?: string;
  iconProvider?: (
    id: NormalizedId,
    registry: NormalizedId<RegistryId>,
  ) => string;
}

const defaultOptions: Required<RecipeGraphOptions> = {
  resolveTags: true,
  brokenIcon: `https://icons.macarena.ceo/icons/minecraft/bedrock.png`,
  iconProvider: (id, registry) => {
    if (registry === "minecraft:fluid") id = suffix(id, "_bucket");
    const { namespace, path } = createId(id);
    return `https://icons.macarena.ceo/icons/${namespace}/${path}.png`;
  },
};

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
  private readonly shown = new Registry<RecipeHolder>();
  private representations: RecipeTypeRepresentation[] = [];

  private readonly options: Required<RecipeGraphOptions>;

  constructor(
    private readonly recipes: JsonLoader<RecipeHolder>,
    private readonly tags: TagRegistryHolder,
    options: RecipeGraphOptions = {},
  ) {
    this.options = { ...defaultOptions, ...options };

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

    this.shown.set(id, recipe);
  }

  clear(): void {
    this.shown.clear();
    this.representations = [];
  }

  resolver(context: BaseContext) {
    return simpleResolver(async (acceptor) => {
      const builder = new GraphBuilder(
        this.tags,
        this.representations,
        this.options,
      );

      const { edges, nodes } = builder.build(this.shown);

      if (edges.length === 0) return;

      await Promise.all([
        acceptor("graph/recipe/nodes.json", toJson(nodes)),
        acceptor("graph/recipe/edges.json", toJson(edges)),
      ]);
    }, context);
  }
}

class GraphBuilder {
  private readonly nodes = new Registry<Omit<Node, "id">>();
  private readonly edges = new Registry<Edge>();

  constructor(
    private readonly tags: TagRegistryHolder,
    private readonly representations: RecipeTypeRepresentation[],
    private readonly options: Required<RecipeGraphOptions>,
  ) {}

  private addIONode(recipeId: NormalizedId, from: InputOutput, input: boolean) {
    const entry = Object.entries(from.ids()).find((it) => it[1].length > 0);
    if (!entry) return;

    const registry = entry[0] as NormalizedId<RegistryId>;
    const id = entry[1][0]!;

    const common = {
      registry,
      label: id,
    } satisfies Partial<Node>;

    if (id.startsWith("#")) {
      this.nodes.set(id, common);
    } else {
      this.nodes.set(id, {
        ...common,
        shape: "image",
        brokenImage: this.options.brokenIcon,
        image: this.options.iconProvider(id, registry),
      });
    }

    this.addIOEdge(recipeId, id, input);
  }

  private addEdge(edge: Edge) {
    this.edges.set(Bun.randomUUIDv7().replaceAll("-", ""), edge);
  }

  private addIOEdge(
    recipeId: NormalizedId,
    id: NormalizedId,
    input: boolean,
    label?: string,
  ) {
    const common: Partial<Edge> = { label, arrows: "to" };
    if (input) {
      this.addEdge({ ...common, from: id, to: recipeId });
    } else {
      this.addEdge({ ...common, from: recipeId, to: id });
    }
  }

  private addRecipeNode(id: NormalizedId, recipe: RecipeHolder) {
    const representation = this.representations.find((it) =>
      it.test(recipe.serializerType),
    );

    const common = {
      id,
      registry: "minecraft:recipe_serializer",
    } satisfies Partial<Node>;

    if (representation) {
      this.nodes.set(id, {
        ...common,
        shape: "image",
        brokenImage: this.options.brokenIcon,
        image: this.options.iconProvider(representation.icon, "minecraft:item"),
        label: representation.label,
      });
    } else {
      this.nodes.set(id, {
        ...common,
        label: id,
      });
    }
  }

  private addRecipe(id: IdInput, recipe: RecipeHolder) {
    const recipeNodeId = prefix(id, "recipe/");
    this.addRecipeNode(recipeNodeId, recipe);
    recipe
      .getIngredients()
      .forEach((it) => this.addIONode(recipeNodeId, it, true));
    recipe
      .getResults()
      .forEach((it) => this.addIONode(recipeNodeId, it, false));
  }

  private sanitize() {
    if (this.options.resolveTags) {
      this.nodes.forEach((node, id) => {
        if (id.isTag) {
          const tags = this.tags.registry(node.registry);
          const entries = tags
            .resolve(id)
            .map((it) => (typeof it === "string" ? it : it.id))
            .map(encodeId);

          const replacements = entries.filter((id) => this.nodes.get(id));

          if (replacements.length == 0) {
            const [entry] = entries;
            if (entry) {
              node.image = this.options.iconProvider(entry, node.registry);
              node.shape = "image";
              node.brokenImage = this.options.brokenIcon;
            }
            return;
          }

          const nodeId = encodeId(id);
          const from = this.edges.filter((it) => it.from === nodeId);
          const to = this.edges.filter((it) => it.to === nodeId);

          const label = `uses any ${nodeId}`;
          replacements.forEach((id) => {
            from.forEach(([, edge]) =>
              this.addIOEdge(edge.to, id, true, label),
            );
            to.forEach(([, edge]) =>
              this.addIOEdge(edge.from, id, false, label),
            );
          });

          from.forEach(([id]) => this.edges.delete(id));
          to.forEach(([id]) => this.edges.delete(id));
        }
      });
    }
  }

  build(shown: Registry<RecipeHolder>): { nodes: Node[]; edges: Edge[] } {
    shown.forEach((recipe, id) => this.addRecipe(id, recipe));
    this.sanitize();
    return { edges: this.edges.values(), nodes: this.nodes.valuesWithId() };
  }
}
