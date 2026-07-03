import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { packFormatOf } from "../../src";
import ResultSerializer from "../../src/common/result/serializer";
import setupLookup from "../shared/dump";
import {
  invalidResultInputs,
  resultInputs,
} from "../shared/provider/1.21.1/resultInputs";
import { provided } from "../shared/provider/providers";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const results = new ResultSerializer(packFormatOf(version), lookup);

describe(`result tests with ${version} format`, () => {
  provided(
    "invalid result inputs",
    invalidResultInputs(),
    (input, expected) => {
      expect(() => {
        results.deserialize(input);
      }).toThrow(expected);
    },
  );

  provided("valid result inputs", resultInputs(), (input, expected) => {
    const actual = results.deserialize(input);
    expect(actual).toBeInstanceOf(expected);
  });
});
