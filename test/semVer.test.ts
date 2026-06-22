import { describe, expect, it } from "bun:test";
import {
  comparseVersions,
  isAtLeastVersion,
  packFormatOf,
  parseSemVer,
} from "../src/index.js";

describe("semantic versions", () => {
  it("parses semantic versions correctly", async () => {
    expect(parseSemVer("12")).toMatchObject({ major: 12, minor: 0, patch: 0 });
    expect(parseSemVer("8.4")).toMatchObject({ major: 8, minor: 4, patch: 0 });
    expect(parseSemVer("8.4.12")).toMatchObject({
      major: 8,
      minor: 4,
      patch: 12,
    });
  });

  it("sorts semantic versions correctly", async () => {
    const sorted = ["17", "1.14.2", "1.18", "1.14.3"].toSorted(
      comparseVersions,
    );

    expect(sorted).toMatchObject(["1.14.2", "1.14.3", "1.18", "17"]);
  });

  it("compares semantic versions correctly", async () => {
    expect(isAtLeastVersion("1.12.1", "1.12.2")).toBeFalse();
    expect(isAtLeastVersion("1.12.1", "1.16")).toBeFalse();
    expect(isAtLeastVersion("1.12.1", "1.17.3")).toBeFalse();
    expect(isAtLeastVersion("1.12.1", "2")).toBeFalse();

    expect(isAtLeastVersion("1.12.1", "1.12.1")).toBeTrue();
    expect(isAtLeastVersion("1.12.1", "1.12")).toBeTrue();
    expect(isAtLeastVersion("1.12.8", "1.12.3")).toBeTrue();
    expect(isAtLeastVersion("1.12.5", "1.10.3")).toBeTrue();
  });

  it("resolved minecraft versions correctly", async () => {
    expect(packFormatOf("1.20.1")).toMatchObject({ major: 15 });
    expect(packFormatOf("1.21.1")).toMatchObject({ major: 48 });
  });
});
