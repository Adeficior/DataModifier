import z from "zod";
import { BlockResult, FluidResult, ItemResult, Result } from ".";
import { IllegalShapeError } from "../../error";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import { IdSchema } from "../id";

interface VersionedDeserializer {
  deserialize(input: Record<string, unknown>): Result | null;
}

class OldDeserializer implements VersionedDeserializer {
  private readonly schemas = {
    itemStack: z.object({
      item: IdSchema,
      count: z.number().int().optional(),
      chance: z.number().optional(),
    }),
    fluidStack: z.object({
      fluid: IdSchema,
      amount: z.number(),
      chance: z.number().optional(),
    }),
    block: z.object({
      block: IdSchema,
    }),
  };

  deserialize(input: Record<string, unknown>): Result | null {
    if ("block" in input) {
      const parsed = this.schemas.block.parse(input);
      return new BlockResult(parsed.block);
    }

    if ("item" in input) {
      const parsed = this.schemas.itemStack.parse(input);
      return new ItemResult(parsed.item, parsed.count, parsed.chance);
    }

    if ("fluid" in input) {
      const parsed = this.schemas.fluidStack.parse(input);
      return new FluidResult(parsed.fluid, parsed.amount, parsed.chance);
    }

    return null;
  }
}

export default class ResultSerializer {
  private readonly deserializer: VersionedDeserializer;

  constructor(
    private readonly packFormat: SemVerInput,
    private readonly lookup: RegistryLookup,
  ) {
    this.deserializer = new OldDeserializer();
  }

  serialize(result: Result) {
    return result.toJSON(this.packFormat);
  }

  serializeList(results: Result[]) {
    return results.map((it) => this.serialize(it));
  }

  private deserialize(input: unknown): Result {
    if (input instanceof Result) return input;

    if (!input) throw new IllegalShapeError("result input may not be null");

    if (typeof input === "string") {
      this.lookup.validateEntry("minecraft:item", input);
      return new ItemResult(input);
    }

    if (typeof input === "object") {
      const deserialized = this.deserializer.deserialize(
        input as Record<string, unknown>,
      );
      if (deserialized) return deserialized;
    }

    throw new IllegalShapeError(`unknown result shape`, input);
  }

  create(input: unknown) {
    const deserialized = this.deserialize(input);
    deserialized.validate(this.lookup);
    return deserialized;
  }

  validated<T extends Result>(result: T): T {
    result.validate(this.lookup);
    return result;
  }

  createList(input: unknown[]) {
    return input.map((it) => this.create(it));
  }
}
