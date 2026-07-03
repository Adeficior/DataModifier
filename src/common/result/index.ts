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
import type { InputOutput } from "../inputOutput";
import { BUCKET } from "../units";

export abstract class Result implements InputOutput {
  validate(_: RegistryLookup): void {}
  abstract idsFor(
    registry: NormalizedId<RegistryId>,
  ): NormalizedId<RegistryId>[];
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

  override idsFor(registry: NormalizedId<RegistryId>) {
    if (this.registry === registry) return [this.id];
    return [];
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
