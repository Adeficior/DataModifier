import z from "zod";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
} from ".";
import { IllegalShapeError } from "../../error";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import { IdSchema, TagSchema } from "../id";

interface VersionedDeserializer {
  deserialize(input: Record<string, unknown>): Ingredient | null;
}

class OldDeserializer implements VersionedDeserializer {
  private readonly schemas = {
    itemTag: z.object({
      tag: TagSchema,
      count: z.number().optional(),
    }),
    fluidTag: z.object({
      fluidTag: TagSchema,
      amount: z.number(),
    }),
    blockTag: z.object({
      blockTag: TagSchema,
      weight: z.number().optional(),
    }),
    itemStack: z.object({
      item: IdSchema,
      count: z.number().int().optional(),
    }),
    fluidStack: z.object({
      fluid: IdSchema,
      amount: z.number(),
    }),
    block: z.object({
      block: IdSchema,
    }),
  };

  deserialize(input: Record<string, unknown>): Ingredient | null {
    if ("blockTag" in input) {
      const parsed = this.schemas.blockTag.parse(input);
      return new BlockTagIngredient(parsed.blockTag);
    }

    if ("tag" in input) {
      const parsed = this.schemas.itemTag.parse(input);
      return new ItemTagIngredient(parsed.tag, parsed.count);
    }

    if ("fluidTag" in input) {
      const parsed = this.schemas.fluidTag.parse(input);
      return new FluidTagIngredient(parsed.fluidTag, parsed.amount);
    }

    if ("block" in input) {
      const parsed = this.schemas.block.parse(input);
      return new BlockIngredient(parsed.block);
    }

    if ("item" in input) {
      const parsed = this.schemas.itemStack.parse(input);
      return new ItemIngredient(parsed.item, parsed.count);
    }

    if ("fluid" in input) {
      const parsed = this.schemas.fluidStack.parse(input);
      return new FluidIngredient(parsed.fluid, parsed.amount);
    }

    return null;
  }
}

export default class IngredientSerializer {
  private readonly deserializer: VersionedDeserializer;

  constructor(
    private readonly packFormat: SemVerInput,
    private readonly lookup: RegistryLookup,
  ) {
    this.deserializer = new OldDeserializer();
  }

  serialize(ingredient: Ingredient) {
    return ingredient.toJSON(this.packFormat);
  }

  private deserialize(input: unknown): Ingredient {
    if (input instanceof Ingredient) return input;

    if (!input) throw new IllegalShapeError("ingredient input may not be null");

    if (typeof input === "string") {
      this.lookup.validateEntry("minecraft:item", input);
      return new ItemIngredient(input);
    }

    if (typeof input === "object") {
      const deserialized = this.deserializer.deserialize(
        input as Record<string, unknown>,
      );
      if (deserialized) return deserialized;
    }

    throw new IllegalShapeError(`unknown ingredient shape`, input);
  }

  create(input: unknown) {
    const deserialized = this.deserialize(input);
    deserialized.validate(this.lookup);
    return deserialized;
  }
}
