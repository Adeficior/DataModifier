import { provided, setupLookup } from "@adeficior/testing";
import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { packFormatOf } from "../../src";
import { createIngredientSerializer } from "../../src/serializer/ingredients";
import { serializedIngredients } from "../util/providers/1.20.1/ingredientOutputs";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const ingredients = createIngredientSerializer(packFormatOf(version), lookup);

describe(`ingredient serialization on ${version}`, () => {
  provided("valid ingredients", serializedIngredients(), (input, expected) => {
    const actual = ingredients.serialize(input);
    expect(actual).toEqual(expected);
  });
});
