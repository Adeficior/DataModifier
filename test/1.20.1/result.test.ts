import { describe, expect } from "bun:test";
import { packFormatOf } from "../../src";
import ResultSerializer from "../../src/common/result/serializer";
import setupLookup from "../shared/dump";
import {
  invalidResultInputs,
  resultInputs,
} from "../shared/provider/1.20.1/resultInputs";
import { provided } from "../shared/provider/providers";

const version = "1.20.1";
const lookup = setupLookup(version);
const results = new ResultSerializer(packFormatOf(version), lookup);

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
