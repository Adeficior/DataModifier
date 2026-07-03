import { describe, expect } from "bun:test";
import { basename } from "node:path";
import { packFormatOf } from "../../src";
import ResultSerializer from "../../src/common/result/serializer";
import setupLookup from "../shared/dump";
import { serializedResults } from "../shared/provider/1.20.1/resultOutputs";
import { provided } from "../shared/provider/providers";

const version = basename(import.meta.dir);
const lookup = setupLookup(version);
const results = new ResultSerializer(packFormatOf(version), lookup);

describe(`result serialization on ${version}`, () => {
  provided("valid results", serializedResults(), (input, expected) => {
    const actual = results.serialize(input);
    expect(actual).toEqual(expected);
  });
});
