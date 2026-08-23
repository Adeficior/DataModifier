import type {
  ClearableEmitter,
  Id,
  IdInput,
  LoaderContext,
} from "@adeficior/data-modifier-core";
import { CustomEmitter } from "@adeficior/data-modifier-core";
import type { LootEmitter } from "@adeficior/data-modifier-loot";
import type {
  BlockstateEmitter,
  ModelEmitter,
} from "@adeficior/data-modifier-models";
import type { BlockId } from "@adeficior/data-modifier/generated";
import type {
  BlockDefinition,
  BlockProperties,
} from "../schema/blockDefinition";

export type BlockDefinitionOptions = Readonly<{
  blockstate?: boolean;
  model?: boolean;
  loot?: boolean;
}>;

type PropertiesOrCopy = BlockProperties | { copy: BlockId };

type ExtendedBlockProperties = PropertiesOrCopy & {
  type?: string;
};

export type BlockDefinitionEmitter = {
  add<T extends BlockDefinition>(id: IdInput, definition: T): T;

  basic(
    id: IdInput,
    properties: ExtendedBlockProperties,
    options?: BlockDefinitionOptions,
  ): BlockDefinition;

  cog(
    id: IdInput,
    properties: ExtendedBlockProperties & { large?: boolean },
    options?: BlockDefinitionOptions,
  ): BlockDefinition;
};

function resolveProperties(from: PropertiesOrCopy): BlockProperties | string {
  if ("copy" in from) return from.copy;
  return from;
}

export abstract class AbstractBlockDefinitionEmitter implements BlockDefinitionEmitter {
  constructor(
    // TODO inject
    private readonly models: ModelEmitter,
    private readonly blockstates: BlockstateEmitter,
    private readonly loot: LootEmitter,
  ) {}

  abstract add<T extends BlockDefinition>(id: IdInput, definition: T): T;

  basic(
    id: IdInput,
    { type, ...properties }: ExtendedBlockProperties,
    options?: BlockDefinitionOptions,
  ) {
    if (options?.model !== false) this.models.cubeAll(id);

    if (options?.blockstate !== false) this.blockstates.basic(id);

    if (options?.loot !== false) this.loot.block(id);

    return this.add(id, {
      type: type ?? "basic",
      properties: resolveProperties(properties),
    });
  }

  cog(
    id: IdInput,
    {
      type,
      large = false,
      ...properties
    }: ExtendedBlockProperties & { large?: boolean },
    options?: BlockDefinitionOptions,
  ) {
    if (options?.model !== false) this.models.cog(id, large);

    if (options?.blockstate !== false) this.blockstates.cog(id);

    if (options?.loot !== false) this.loot.block(id);

    return this.add(id, {
      type: type ?? "create:cog",
      large,
      properties: resolveProperties(properties),
    });
  }
}

export class BlockDefinitionEmitterImpl
  extends AbstractBlockDefinitionEmitter
  implements ClearableEmitter
{
  private readonly custom = new CustomEmitter<BlockDefinition>(this.filePath);

  private filePath(id: Id) {
    return `content/${id.namespace}/block/${id.path}.json`;
  }

  add<T extends BlockDefinition>(id: IdInput, definition: T) {
    this.custom.add(id, definition);
    return definition;
  }

  resolver(context: LoaderContext) {
    return this.custom.resolver(context);
  }

  clear() {
    this.custom.clear();
  }
}
