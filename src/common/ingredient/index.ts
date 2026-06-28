import type {
  BlockId,
  FluidId,
  ItemId,
  RegistryId,
} from "@adeficior/data-modifier/generated";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import {
  encodeId,
  stripTag,
  toTag,
  type IdInput,
  type NormalizedId,
  type TagId,
} from "../id";
import { BlockResult, FluidResult, ItemResult, type Result } from "../result";
import type { Serializable } from "../serializable";
import { BUCKET } from "../units";

export abstract class Ingredient implements Serializable {
  // TODO make required
  validate(_: RegistryLookup): void {}
  abstract serialize(packFormat: SemVerInput): unknown;
  abstract idsFor(
    registry: NormalizedId<RegistryId>,
  ): NormalizedId<RegistryId>[];
  abstract asResult(): Result;
}

export abstract class TagIngredient extends Ingredient {
  public readonly tag: TagId;

  constructor(
    input: IdInput,
    private readonly registry: NormalizedId<RegistryId>,
  ) {
    super();
    // TODO complain if input is already a tag?
    this.tag = toTag(input);
  }

  override idsFor(registry: NormalizedId<RegistryId>) {
    if (this.registry === registry) return [this.tag];
    return [];
  }

  override asResult(): Result {
    throw new Error("tag ingredients cannot be transformed into a result");
  }
}

export class ItemTagIngredient extends TagIngredient {
  constructor(
    tag: IdInput,
    public readonly count = 1,
  ) {
    super(tag, "minecraft:item");
  }

  serialize(_packFormat: SemVerInput) {
    const count = this.count === 1 ? undefined : this.count;
    const tag = stripTag(this.tag);
    return { tag, count };
  }
}

export class FluidTagIngredient extends TagIngredient {
  constructor(
    tag: IdInput,
    public readonly amount = BUCKET,
  ) {
    super(tag, "minecraft:fluid");
  }

  serialize(_packFormat: SemVerInput) {
    const { amount } = this;
    const tag = stripTag(this.tag);
    return { fluidTag: tag, amount };
  }
}

export class BlockTagIngredient extends TagIngredient {
  constructor(tag: IdInput) {
    super(tag, "minecraft:block");
  }

  serialize(_packFormat: SemVerInput) {
    const tag = stripTag(this.tag);
    return { blockTag: tag };
  }
}

export abstract class RegistryEntryIngredient<
  T extends string,
> extends Ingredient {
  public readonly id: NormalizedId<T>;

  constructor(
    input: IdInput<T>,
    private readonly registry: NormalizedId<RegistryId>,
  ) {
    super();
    this.id = encodeId(input);
  }

  override idsFor(registry: NormalizedId<RegistryId>) {
    if (this.registry === registry) return [this.id];
    return [];
  }
}

export class ItemIngredient extends RegistryEntryIngredient<ItemId> {
  constructor(
    id: IdInput<ItemId>,
    public readonly count = 1,
  ) {
    super(id, "minecraft:item");
  }

  serialize(_packFormat: SemVerInput) {
    const count = this.count === 1 ? undefined : this.count;
    const id = encodeId(this.id);
    return { item: id, count };
  }

  override validate(lookup: RegistryLookup): void {
    lookup.validateEntry("minecraft:item", this.id);
  }

  override asResult() {
    return new ItemResult(this.id, this.count);
  }
}

export class FluidIngredient extends RegistryEntryIngredient<FluidId> {
  constructor(
    id: IdInput<FluidId>,
    public readonly amount = BUCKET,
    public readonly chance?: number,
  ) {
    super(id, "minecraft:fluid");
  }

  serialize(_packFormat: SemVerInput) {
    const { amount } = this;
    const id = encodeId(this.id);
    return { fluid: id, amount };
  }

  override validate(lookup: RegistryLookup): void {
    lookup.validateEntry("minecraft:fluid", this.id);
  }

  override asResult() {
    return new FluidResult(this.id, this.amount);
  }
}

export class BlockIngredient extends RegistryEntryIngredient<BlockId> {
  constructor(
    id: IdInput<BlockId>,
    public readonly weight?: number,
  ) {
    super(id, "minecraft:block");
  }

  serialize(_packFormat: SemVerInput) {
    const { weight } = this;
    const id = encodeId(this.id);
    return { block: id, weight };
  }

  override validate(lookup: RegistryLookup): void {
    lookup.validateEntry("minecraft:block", this.id);
  }

  override asResult() {
    return new BlockResult(this.id);
  }
}

export class ListIngredient extends Ingredient {
  constructor(public readonly entries: Ingredient[]) {
    super();
  }

  override serialize(packFormat: SemVerInput) {
    return this.entries.map((it) => it.serialize(packFormat));
  }

  override validate(lookup: RegistryLookup): void {
    this.entries.forEach((it) => it.validate(lookup));
  }

  override idsFor(registry: NormalizedId<RegistryId>) {
    return this.entries.flatMap((it) => it.idsFor(registry));
  }

  override asResult(): Result {
    throw new Error("union ingredients cannot be transformed into a result");
  }
}

export type ItemLikeIngredient = ItemTagIngredient | ItemIngredient;
export type FluidLikeIngredient = FluidTagIngredient | FluidIngredient;
export type BlockLikeIngredient = BlockTagIngredient | BlockIngredient;
