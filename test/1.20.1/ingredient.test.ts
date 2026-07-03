import { describe, expect } from "bun:test";
import { packFormatOf } from "../../src";
import IngredientSerializer from "../../src/common/ingredient/serializer";
import setupLookup from "../shared/dump";
import {
  ingredientInputs,
  invalidIngredientInputs,
} from "../shared/provider/1.20.1/ingredientInputs";
import { provided } from "../shared/provider/providers";

const version = "1.20.1";
const lookup = setupLookup(version);
const ingredients = new IngredientSerializer(packFormatOf(version), lookup);

describe("ingredient tests with 1.20.1 format", () => {
  provided(
    "invalid ingredient inputs",
    invalidIngredientInputs(),
    (input, expected) => {
      expect(() => {
        ingredients.deserialize(input);
      }).toThrow(expected);
    },
  );

  provided("valid ingredient inputs", ingredientInputs(), (input, expected) => {
    const actual = ingredients.deserialize(input);
    expect(actual).toBeInstanceOf(expected);
  });
});
