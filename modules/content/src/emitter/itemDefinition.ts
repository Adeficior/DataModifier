import type {
  ClearableEmitter,
  Id,
  IdInput,
  LoaderContext,
} from "@adeficior/data-modifier-core";
import { CustomEmitter, prefix } from "@adeficior/data-modifier-core";
import type { LootEmitter } from "@adeficior/data-modifier-loot";
import type {
  BlockstateEmitter,
  ModelEmitter,
} from "@adeficior/data-modifier-models";
import type { BlockDefinition } from "../schema/blockDefinition";
import type { ItemDefinition, ItemProperties } from "../schema/itemDefinition";
import type { BlockDefinitionEmitterWithoutId } from "./innerBlockDefinition";
import { createInnerBlockDefinitionBuilder } from "./innerBlockDefinition";

export type ItemDefinitionOptions = Readonly<{
  model?: boolean;
}>;

type ExtendedItemProperties = ItemProperties & {
  type?: string;
};

type BlockDefinitionInput =
  | BlockDefinition
  | ((rules: BlockDefinitionEmitterWithoutId) => BlockDefinition);

export type ItemDefinitionEmitter = {
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
};

export class ItemDefinitionEmitterImpl
  implements ItemDefinitionEmitter, ClearableEmitter
{
  private readonly custom = new CustomEmitter<ItemDefinition>(this.filePath);

  constructor(
    // TODO inject
    private readonly itemModels: ModelEmitter,
    private readonly blockModels: ModelEmitter,
    private readonly blockstates: BlockstateEmitter,
    private readonly loot: LootEmitter,
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
