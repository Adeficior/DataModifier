import type {
  BlockId,
  FluidId,
  ItemId,
  RegistryId,
} from "@adeficior/data-modifier/generated";
import type RegistryLookup from "../../loader/registry";
import { encodeId, type IdInput, type NormalizedId } from "../id";
import {
  BlockIngredient,
  FluidIngredient,
  ItemIngredient,
  type Ingredient,
} from "../ingredient";
import type { InputOutput, RegistryIds } from "../inputOutput";
import { BUCKET } from "../units";

export abstract class Result implements InputOutput {
  validate(_: RegistryLookup): void {}
  abstract ids(): RegistryIds;
  abstract asIngredient(): Ingredient;
}

export abstract class RegistryEntryResult<T extends string> extends Result {
  public readonly id: NormalizedId<T>;

  constructor(
    input: IdInput<T>,
    private readonly registry: NormalizedId<RegistryId>,
  ) {
    super();
    this.id = encodeId(input);
  }

  override ids(): RegistryIds {
    return { [this.registry]: [this.id] };
  }
}

export class ItemResult extends RegistryEntryResult<ItemId> {
  constructor(
    id: IdInput<ItemId>,
    public readonly count = 1,
    public readonly chance?: number,
  ) {
    super(id, "minecraft:item");
  }

  override validate(lookup: RegistryLookup): void {
    lookup.validateEntry("minecraft:item", this.id);
  }

  override asIngredient() {
    return new ItemIngredient(this.id, this.count);
  }
}

export class FluidResult extends RegistryEntryResult<FluidId> {
  constructor(
    id: IdInput<FluidId>,
    public readonly amount: number = BUCKET,
    public readonly chance?: number,
  ) {
    super(id, "minecraft:fluid");
  }

  override validate(lookup: RegistryLookup): void {
    lookup.validateEntry("minecraft:fluid", this.id);
  }

  override asIngredient() {
    return new FluidIngredient(this.id, this.amount);
  }
}

export class BlockResult extends RegistryEntryResult<BlockId> {
  constructor(id: IdInput<BlockId>) {
    super(id, "minecraft:block");
  }

  override validate(lookup: RegistryLookup): void {
    lookup.validateEntry("minecraft:block", this.id);
  }

  override asIngredient() {
    return new BlockIngredient(this.id);
  }
}

export class IgnoredResult extends Result {
  constructor(public readonly raw: unknown) {
    super();
  }

  override asIngredient(): Ingredient {
    throw new Error("ignored result cannot be transformed into a ingredient");
  }

  override ids(): RegistryIds {
    return {};
  }
}
