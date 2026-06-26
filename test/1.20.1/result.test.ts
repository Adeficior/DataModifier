import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { beforeAll, describe, expect } from "bun:test";
import { packFormatOf } from "../../src";
import ResultSerializer from "../../src/common/result/serializer";
import RegistryDumpLoader from "../../src/loader/registry/dump";
import {
  invalidResultInputs,
  resultInputs,
} from "../shared/provider/1.20.1/resultInputs";
import { provided } from "../shared/provider/providers";
import { createDumpResolver } from "../shared/testData";

const logger = createTestLogger();
const version = "1.20.1";
const registries = new RegistryDumpLoader(logger);
const results = new ResultSerializer(packFormatOf(version), registries);

beforeAll(async () => {
  await registries.extract(createDumpResolver(version));
});

describe("result tests with 1.20.1 format", () => {
  provided(
    "invalid result inputs",
    invalidResultInputs(),
    (input, expected) => {
      expect(() => {
        results.create(input);
      }).toThrow(expected);
    },
  );

  provided("valid result inputs", resultInputs(), (input, expected) => {
    const actual = results.create(input);
    expect(actual).toBeInstanceOf(expected);
  });
});
