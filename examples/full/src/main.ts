import { createDataModifierFromConfig } from "@adeficior/data-modifier";
import type { ItemId } from "@adeficior/data-modifier/generated";
import { createAcceptor } from "@adeficior/pack-resolver";
import config from "./datamod.config";

const modifier = await createDataModifierFromConfig(config);

const coalBlock: ItemId = "minecraft:coal_block";
modifier.recipes.vanilla.shaped(
  [
    [coalBlock, coalBlock, coalBlock],
    [coalBlock, coalBlock, coalBlock],
    [coalBlock, coalBlock, coalBlock],
  ],
  "minecraft:diamond",
);

modifier.lang.entryName(
  "minecraft:item",
  "create:acacia_window",
  "Acacia Whatever",
);

const acceptor = await createAcceptor("generated");

await modifier.emit(acceptor);
