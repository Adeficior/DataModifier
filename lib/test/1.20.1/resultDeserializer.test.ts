import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { packFormatOf } from "../../src";
import { createResultSerializer } from "../../src/serializer/results";
import setupLookup from "../shared/dump";
import {
  invalidResultInputs,
  resultInputs,
} from "../shared/provider/1.20.1/resultInputs";
import { provided } from "../shared/provider/providers";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const results = createResultSerializer(packFormatOf(version), lookup);

describe(`result deserialization on ${version}`, () => {
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
