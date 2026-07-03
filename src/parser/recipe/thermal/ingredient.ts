import z from "zod";
import { AmountSchema, CountSchema } from "../../../common/fields.js";
import { encodeId, IdSchema } from "../../../common/id.js";
import {
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
  type Ingredient,
} from "../../../common/ingredient/index.js";
import type IngredientSerializer from "../../../common/ingredient/serializer.js";
import { IllegalShapeError } from "../../../error.js";

const ThermalFluidTagSchema = z.object({
  fluid_tag: IdSchema,
  amount: AmountSchema,
});

const ThermalItemEntry = z.object({
  item: IdSchema,
});

const ThermalTagEntry = z.object({
  tag: IdSchema,
});

const ThermalIngredientEntry = ThermalItemEntry.or(ThermalTagEntry);
const ThermalIngredientList = z.object({
  value: z.array(ThermalIngredientEntry),
  count: CountSchema,
});

type ThermalFluidTag = z.infer<typeof ThermalFluidTagSchema>;

// TODO serialize this?
// type ThermalItemList = z.infer<typeof ThermalIngredientList>;

export function createThermalIngredients(
  ingredients: IngredientSerializer,
  input: unknown,
): Ingredient[] {
  if (input && typeof input === "object") {
    if ("value" in input) {
      const parsed = ThermalIngredientList.parse(input);
      return parsed.value.map((it) => {
        if ("item" in it) return new ItemIngredient(it.item, parsed.count);
        if ("tag" in it) return new ItemTagIngredient(it.tag, parsed.count);
        throw new IllegalShapeError("unknown ingredient list entry shape", it);
      });
    }

    if ("fluid_tag" in input) {
      const parsed = ThermalFluidTagSchema.parse(input);
      return [new FluidTagIngredient(parsed.fluid_tag, parsed.amount)];
    }
  }

  return [ingredients.deserialize(input)];
}

export function serializeThermalIngredient(
  ingredients: IngredientSerializer,
  ingredient: Ingredient,
): unknown {
  if (ingredient instanceof FluidTagIngredient) {
    return {
      fluid_tag: encodeId(ingredient.tag),
      amount: ingredient.amount,
    } satisfies ThermalFluidTag;
  }

  return ingredients.serialize(ingredient);
}
