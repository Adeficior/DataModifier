import z from "zod";
import { AmountSchema, CountSchema } from "../../../common/fields.js";
import { IdSchema } from "../../../common/id.js";
import {
  FluidTagIngredient,
  ItemIngredient,
  ItemTagIngredient,
  ListIngredient,
  type Ingredient,
} from "../../../common/ingredient";
import { isObjectWith } from "../../../serializer/checks.js";
import { createSerializerModule } from "../../../serializer/module.js";

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

const ingredientSerializer15 = createSerializerModule<Ingredient>((builder) => {
  builder.deserializer(isObjectWith("value"), (input) => {
    const { value, count } = ThermalIngredientList.parse(input);
    return new ListIngredient(
      value.map((it) => {
        if ("item" in it) return new ItemIngredient(it.item, count);
        return new ItemTagIngredient(it.tag, count);
      }),
    );
  });

  builder.register(
    FluidTagIngredient,
    isObjectWith("fluid_tag"),
    ThermalFluidTagSchema,
    ({ fluid_tag, amount }) => new FluidTagIngredient(fluid_tag, amount),
    ({ tag, amount }) => ({ fluid_tag: tag, amount }),
  );
});

export const ingredientSerializerModules = {
  15: ingredientSerializer15,
};
