import type {
  BlockId,
  FluidId,
  ItemId,
} from "@adeficior/data-modifier/generated";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import { encodeId, type IdInput } from "../id";
import type { Serializable } from "../serializable";
import { BUCKET } from "../units";

export abstract class Ingredient implements Serializable {
  // TODO make required
  validate(_?: RegistryLookup): void {}
  abstract toJSON(packFormat: SemVerInput): unknown;
}

export class ItemTagIngredient extends Ingredient {
  constructor(
    public readonly tag: IdInput,
    public readonly count = 1,
  ) {
    super();
  }

  toJSON(_packFormat: SemVerInput) {
    const count = this.count === 1 ? undefined : this.count;
    const tag = encodeId(this.tag);
    return { tag, count };
  }
}

export class FluidTagIngredient extends Ingredient {
  constructor(
    public readonly tag: IdInput,
    public readonly amount = BUCKET,
  ) {
    super();
  }

  toJSON(_packFormat: SemVerInput) {
    const { amount } = this;
    const tag = encodeId(this.tag);
    return { fluidTag: tag, amount };
  }
}

export class BlockTagIngredient extends Ingredient {
  constructor(public readonly tag: IdInput) {
    super();
  }

  toJSON(_packFormat: SemVerInput) {
    const tag = encodeId(this.tag);
    return { blockTag: tag };
  }
}

export class ItemIngredient extends Ingredient {
  constructor(
    public readonly id: IdInput<ItemId>,
    public readonly count = 1,
  ) {
    super();
  }

  toJSON(_packFormat: SemVerInput) {
    const count = this.count === 1 ? undefined : this.count;
    const id = encodeId(this.id);
    return { item: id, count };
  }

  override validate(lookup?: RegistryLookup): void {
    lookup?.validateEntry("minecraft:item", this.id);
  }
}

export class FluidIngredient extends Ingredient {
  constructor(
    public readonly id: IdInput<FluidId>,
    public readonly amount = BUCKET,
    public readonly chance?: number,
  ) {
    super();
  }

  toJSON(_packFormat: SemVerInput) {
    const { amount } = this;
    const id = encodeId(this.id);
    return { fluid: id, amount };
  }

  override validate(lookup?: RegistryLookup): void {
    lookup?.validateEntry("minecraft:fluid", this.id);
  }
}

export class BlockIngredient extends Ingredient {
  constructor(
    public readonly id: IdInput<BlockId>,
    public readonly weight?: number,
  ) {
    super();
  }

  toJSON(_packFormat: SemVerInput) {
    const { weight } = this;
    const id = encodeId(this.id);
    return { block: id, weight };
  }

  override validate(lookup?: RegistryLookup): void {
    lookup?.validateEntry("minecraft:block", this.id);
  }
}

export class ListIngredient extends Ingredient {
  constructor(public readonly entries: Ingredient[]) {
    super();
  }

  override toJSON(packFormat: SemVerInput) {
    return this.entries.map((it) => it.toJSON(packFormat));
  }

  override validate(lookup?: RegistryLookup): void {
    this.entries.forEach((it) => it.validate(lookup));
  }
}

export type ItemLikeIngredient = ItemTagIngredient | ItemIngredient;
export type FluidLikeIngredient = FluidTagIngredient | FluidIngredient;
export type BlockLikeIngredient = BlockTagIngredient | BlockIngredient;
