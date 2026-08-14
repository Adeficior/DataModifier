import {
  type ClearableEmitter,
  type Id,
  type IdInput,
  type LoaderContext,
} from "@adeficior/data-modifier-core";
import { CustomEmitter, prefix } from "@adeficior/data-modifier-core";
import { type LootRules } from "@adeficior/data-modifier-loot";
import {
  type BlockstateRules,
  type ModelRules,
} from "@adeficior/data-modifier-models";
import { type BlockDefinition } from "../schema/blockDefinition";
import {
  type ItemDefinition,
  type ItemProperties,
} from "../schema/itemDefinition";
import { type BlockDefinitionRulesWithoutId } from "./innerBlockDefinition";
import { createInnerBlockDefinitionBuilder } from "./innerBlockDefinition";

export type ItemDefinitionOptions = Readonly<{
  model?: boolean;
}>;

type ExtendedItemProperties = ItemProperties & {
  type?: string;
};

type BlockDefinitionInput =
  BlockDefinition | ((rules: BlockDefinitionRulesWithoutId) => BlockDefinition);

export interface ItemDefinitionRules {
  add<T extends ItemDefinition>(id: IdInput, definition: T): T;

  basic(
    id: IdInput,
    properties?: ExtendedItemProperties,
    options?: ItemDefinitionOptions,
  ): ItemDefinition;

  blockItem(
    id: IdInput,
    properties?: ExtendedItemProperties & {
      block: BlockDefinitionInput;
    },
    options?: ItemDefinitionOptions,
  ): ItemDefinition;
}

export class ItemDefinitionEmitter
  implements ItemDefinitionRules, ClearableEmitter
{
  private readonly custom = new CustomEmitter<ItemDefinition>(this.filePath);

  constructor(
    // TODO inject
    private readonly itemModels: ModelRules,
    private readonly blockModels: ModelRules,
    private readonly blockstates: BlockstateRules,
    private readonly loot: LootRules,
  ) {}

  private filePath(id: Id) {
    return `content/${id.namespace}/item/${id.path}.json`;
  }

  add<T extends ItemDefinition>(id: IdInput, definition: T) {
    this.custom.add(id, definition);
    return definition;
  }

  clear() {
    this.custom.clear();
  }

  resolver(context: LoaderContext) {
    return this.custom.resolver(context);
  }

  basic(
    id: IdInput,
    { type, ...properties }: ExtendedItemProperties = {},
    options?: ItemDefinitionOptions,
  ) {
    if (options?.model !== false) this.itemModels.flat(id);

    return this.add(id, {
      type: type ?? "basic",
      properties,
    });
  }

  private createBlockDefinition(id: IdInput, input: BlockDefinitionInput) {
    if (typeof input !== "function") return input;
    const blockBuilder = createInnerBlockDefinitionBuilder(
      id,
      this.blockModels,
      this.blockstates,
      this.loot,
    );
    return input(blockBuilder);
  }

  blockItem(
    id: IdInput,
    {
      block,
      type,
      ...properties
    }: ExtendedItemProperties & {
      block: BlockDefinitionInput;
    },
    options?: ItemDefinitionOptions,
  ) {
    if (options?.model !== false) {
      const parent = prefix(id, "block/");
      this.itemModels.add(id, { parent });
    }

    const blockDefinition = this.createBlockDefinition(id, block);

    return this.add(id, {
      type: type ?? "block_item",
      block: blockDefinition,
      properties,
    });
  }
}
