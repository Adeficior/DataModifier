import { provided, setupLookup } from "@adeficior/testing";
import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { packFormatOf } from "../../src";
import { createResultSerializer } from "../../src/serializer/results";
import {
  invalidResultInputs,
  resultInputs,
} from "../util/providers/1.20.1/resultInputs";

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
