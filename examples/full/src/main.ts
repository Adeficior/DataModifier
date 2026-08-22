import { createDataModifier, packFormatOf } from "@adeficior/data-modifier";

const modifier = await createDataModifier({
  packFormat: packFormatOf("1.21.1"),
});

const coalBlock = "minecraft:coal_block";
modifier.recipes.vanilla.shaped(
  [
    [coalBlock, coalBlock, coalBlock],
    [coalBlock, coalBlock, coalBlock],
    [coalBlock, coalBlock, coalBlock],
  ],
  "minecraft:diamond",
);
