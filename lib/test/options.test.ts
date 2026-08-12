import { defineModule, packFormatOf } from "@adeficior/data-modifier-core";
import { createTestLogger } from "@adeficior/pack-resolver/testing";
import { expect, it, mock } from "bun:test";
import { createDataModifier } from "../src";

it("correctly passed options to installed modules", async () => {
  const mockA = mock();
  const moduleA = defineModule<{
    options: {
      moduleAKey: string;
    };
  }>({
    name: "a",
    setup: ({ options }) => {
      mockA(options.moduleAKey);
    },
  });

  const mockB = mock();
  const moduleB = defineModule<{
    options: {
      moduleBKey: string;
    };
  }>({
    name: "b",
    setup: ({ options }) => {
      mockB(options.moduleBKey);
    },
  });

  await createDataModifier(
    {
      packFormat: packFormatOf("1.21.1"),
      logger: createTestLogger(),
    },
    (modifier) => {
      modifier.install(moduleA, { moduleAKey: "valueA" });
      modifier.install(moduleB, { moduleBKey: "valueB" });
    },
  );

  expect(mockA).toBeCalledWith("valueA");
  expect(mockB).toBeCalledWith("valueB");
});
