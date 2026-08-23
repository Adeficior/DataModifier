import { createDataModifier, packFormatOf } from "@adeficior/data-modifier";
import { createAcceptor } from "@adeficior/pack-resolver";

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

const acceptor = await createAcceptor("generated");

await modifier.emit(acceptor);
