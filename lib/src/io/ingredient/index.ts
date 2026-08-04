import type {
  BlockId,
  FluidId,
  ItemId,
  RegistryId,
} from "@adeficior/data-modifier/generated";
import { uniq } from "lodash-es";
import type RegistryLookup from "../../loader/registry";
import {
  encodeId,
  toTag,
  type IdInput,
  type NormalizedId,
  type TagId,
} from "../id";
import type { InputOutput, RegistryIds } from "../inputOutput";
import { BlockResult, FluidResult, ItemResult, type Result } from "../result";
import { BUCKET } from "../units";

export abstract class Ingredient implements InputOutput {
  validate(_: RegistryLookup): void {}
  abstract ids(): RegistryIds;
  abstract asResult(): Result;
}

export abstract class TagIngredient extends Ingredient {
  public readonly tag: TagId;

  constructor(
    input: IdInput,
    public readonly registry: NormalizedId<RegistryId>,
  ) {
    super();
    // TODO complain if input is already a tag?
    this.tag = toTag(input);
  }

  override ids(): RegistryIds {
    return { [this.registry]: [this.tag] };
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
}

export class FluidTagIngredient extends TagIngredient {
  constructor(
    tag: IdInput,
    public readonly amount = BUCKET,
  ) {
    super(tag, "minecraft:fluid");
  }
}

export class BlockTagIngredient extends TagIngredient {
  constructor(tag: IdInput) {
    super(tag, "minecraft:block");
  }
}

export abstract class RegistryEntryIngredient<
  T extends string,
> extends Ingredient {
  public readonly id: NormalizedId<T>;

  constructor(
    input: IdInput<T>,
    public readonly registry: NormalizedId<RegistryId>,
  ) {
    super();
    this.id = encodeId(input);
  }

  override ids(): RegistryIds {
    return { [this.registry]: [this.id] };
  }
}

export class ItemIngredient extends RegistryEntryIngredient<ItemId> {
  constructor(
    id: IdInput<ItemId>,
    public readonly count = 1,
  ) {
    super(id, "minecraft:item");
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

  override validate(lookup: RegistryLookup): void {
    this.entries.forEach((it) => it.validate(lookup));
  }

  override ids(): RegistryIds {
    return this.entries
      .map((it) => it.ids())
      .reduce((a, b) => {
        const keys = uniq([
          ...Object.keys(a),
          ...Object.keys(b),
        ]) as NormalizedId<RegistryId>[];

        const out: RegistryIds = {};

        keys.forEach((key) => {
          out[key] = uniq([...(a[key] ?? []), ...(b[key] ?? [])]);
        });

        return out;
      }, {});
  }

  override asResult(): Result {
    throw new Error("union ingredients cannot be transformed into a result");
  }
}

export type ItemLikeIngredient = ItemTagIngredient | ItemIngredient;
export type FluidLikeIngredient = FluidTagIngredient | FluidIngredient;
export type BlockLikeIngredient = BlockTagIngredient | BlockIngredient;

export class ToolActionIngredient extends Ingredient {
  constructor(public readonly action: string) {
    super();
  }

  override asResult(): Result {
    throw new Error(
      "tool action ingredient cannot be transformed into a result",
    );
  }

  override ids(): RegistryIds {
    return {};
  }
}

export class IgnoredIngredient extends Ingredient {
  constructor(public readonly raw: unknown) {
    super();
  }

  override asResult(): Result {
    throw new Error("ignored ingredient cannot be transformed into a result");
  }

  override ids(): RegistryIds {
    return {};
  }
}
