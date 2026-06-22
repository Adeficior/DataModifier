import type {
  BlockId,
  FluidId,
  ItemId,
} from "@adeficior/data-modifier/generated";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import { encodeId, type IdInput } from "../id";
import type { Serializable } from "../serializable";

export abstract class Result implements Serializable {
  validate(_?: RegistryLookup): void {}
  abstract toJSON(packFormat: SemVerInput): unknown;
}

export class ItemResult extends Result {
  constructor(
    public readonly id: IdInput<ItemId>,
    public readonly count = 1,
    public readonly chance?: number,
  ) {
    super();
  }

  toJSON(_packFormat: SemVerInput): unknown {
    const { count, chance } = this;
    const id = encodeId(this.id);
    return { item: id, count, chance };
  }

  override validate(lookup?: RegistryLookup): void {
    lookup?.validateEntry("minecraft:item", this.id);
  }
}

export class FluidResult extends Result {
  constructor(
    public readonly id: IdInput<FluidId>,
    public readonly amount: number,
    public readonly chance?: number,
  ) {
    super();
  }

  toJSON(_packFormat: SemVerInput): unknown {
    const { amount, chance } = this;
    const id = encodeId(this.id);
    return { fluid: id, amount, chance };
  }

  override validate(lookup?: RegistryLookup): void {
    lookup?.validateEntry("minecraft:fluid", this.id);
  }
}

export class BlockResult extends Result {
  constructor(public readonly id: IdInput<BlockId>) {
    super();
  }

  toJSON(_packFormat: SemVerInput): unknown {
    const id = encodeId(this.id);
    return { block: id };
  }

  override validate(lookup?: RegistryLookup): void {
    lookup?.validateEntry("minecraft:block", this.id);
  }
}
