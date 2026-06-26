import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { beforeAll, describe, expect } from "bun:test";
import { packFormatOf } from "../../src";
import IngredientSerializer from "../../src/common/ingredient/serializer";
import RegistryDumpLoader from "../../src/loader/registry/dump";
import {
  ingredientInputs,
  invalidIngredientInputs,
} from "../shared/provider/1.20.1/ingredientInputs";
import { provided } from "../shared/provider/providers";
import { createDumpResolver } from "../shared/testData";

const logger = createTestLogger();
const version = "1.20.1";
const lookup = new RegistryDumpLoader(logger);
const ingredients = new IngredientSerializer(packFormatOf(version), lookup);

beforeAll(async () => {
  await lookup.extract(createDumpResolver(version));
});

describe("ingredient tests with 1.20.1 format", () => {
  provided(
    "invalid ingredient inputs",
    invalidIngredientInputs(),
    (input, expected) => {
      expect(() => {
        ingredients.create(input);
      }).toThrow(expected);
    },
  );

  provided("valid ingredient inputs", ingredientInputs(), (input, expected) => {
    const actual = ingredients.create(input);
    expect(actual).toBeInstanceOf(expected);
  });
});
