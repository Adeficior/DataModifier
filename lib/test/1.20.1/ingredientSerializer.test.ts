import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { packFormatOf } from "../../src";
import { createIngredientSerializer } from "../../src/serializer/ingredients";
import setupLookup from "../shared/dump";
import { serializedIngredients } from "../shared/provider/1.20.1/ingredientOutputs";
import { provided } from "../shared/provider/providers";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const ingredients = createIngredientSerializer(packFormatOf(version), lookup);

describe(`ingredient serialization on ${version}`, () => {
  provided("valid ingredients", serializedIngredients(), (input, expected) => {
    const actual = ingredients.serialize(input);
    expect(actual).toEqual(expected);
  });
});
