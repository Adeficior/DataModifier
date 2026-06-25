import { mapValues } from "lodash-es";
import z from "zod";
import {
  BlockIngredient,
  BlockTagIngredient,
  FluidIngredient,
  FluidTagIngredient,
  Ingredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
} from ".";
import { IllegalShapeError, transformErrors } from "../../error";
import type RegistryLookup from "../../loader/registry";
import type { SemVerInput } from "../../packFormat";
import {
  IngredientMap,
  type IngredientMapInput,
} from "../../parser/recipe/ingredientMap";
import { IdSchema } from "../id";

interface VersionedDeserializer {
  deserialize(input: Record<string, unknown>): Ingredient | null;
}

const CountSchema = z.number().int().positive().default(1);
const AmountSchema = z.number().positive();

class OldDeserializer implements VersionedDeserializer {
  private readonly schemas = {
    itemTag: z.object({
      tag: IdSchema,
      count: CountSchema,
    }),
    fluidTag: z.object({
      fluidTag: IdSchema,
      amount: AmountSchema,
    }),
    blockTag: z.object({
      blockTag: IdSchema,
      weight: z.number().optional(),
    }),
    itemStack: z.object({
      item: IdSchema,
      count: CountSchema,
    }),
    fluidStack: z.object({
      fluid: IdSchema,
      amount: AmountSchema,
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
    return ingredient.serialize(this.packFormat);
  }

  serializeList(ingredients: Ingredient[]) {
    return ingredients.map((it) => this.serialize(it));
  }

  private deserialize(input: unknown): Ingredient {
    if (input instanceof Ingredient) return input;

    if (!input) throw new IllegalShapeError("ingredient input may not be null");

    if (typeof input === "string") {
      if (input.startsWith("#")) {
        return this.deserialize(new ItemTagIngredient(input));
      }

      this.lookup.validateEntry("minecraft:item", input);
      return new ItemIngredient(input);
    }

    if (Array.isArray(input)) {
      return new ListIngredient(input.map((it) => this.deserialize(it)));
    }

    if (typeof input === "object") {
      const deserialized = this.deserializer.deserialize(
        input as Record<string, unknown>,
      );
      if (deserialized) return deserialized;
    }

    throw new IllegalShapeError(`unknown ingredient shape`, input);
  }

  // TODO rename deserialize
  create(input: unknown) {
    return transformErrors(() => {
      const deserialized = this.deserialize(input);
      deserialized.validate(this.lookup);
      return deserialized;
    });
  }

  validated<T extends Ingredient>(ingredient: T): T {
    ingredient.validate(this.lookup);
    return ingredient;
  }

  createList(input: unknown[]) {
    return input.map((it) => this.create(it));
  }

  ingredientMap(input: IngredientMapInput) {
    return new IngredientMap(mapValues(input, (it) => this.create(it)));
  }
}
