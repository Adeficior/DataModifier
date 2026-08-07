import type { SemVerInput } from "@adeficior/data-modifier-core";
import { packFormatOf } from "@adeficior/data-modifier-core";
import {
  mockPredicates,
  mockRegistryLookup,
  mockRegistryProvider,
} from "@adeficior/testing";
import { LootTableEmitter } from "../../../loot/src/emitter";
import { BlockstateEmitter } from "../../../models/src/emitter/blockstates";
import { ModelEmitter } from "../../../models/src/emitter/models";
import { BlockDefinitionEmitter } from "../../src/emitter/blockDefinition";
import { ItemDefinitionEmitter } from "../../src/emitter/itemDefinition";

export function createBlockDefinitionEmitter(version: SemVerInput) {
  const emitter = new BlockDefinitionEmitter(
    // mock instead?
    new ModelEmitter("block"),
    new BlockstateEmitter(),
    new LootTableEmitter(
      packFormatOf(version),
      mockRegistryProvider(),
      mockRegistryLookup(),
      mockPredicates(),
    ),
  );

  return { emitter };
}

export function createItemDefinitionEmitter(version: SemVerInput) {
  const emitter = new ItemDefinitionEmitter(
    // mock instead?
    new ModelEmitter("item"),
    new ModelEmitter("block"),
    new BlockstateEmitter(),
    new LootTableEmitter(
      packFormatOf(version),
      mockRegistryProvider(),
      mockRegistryLookup(),
      mockPredicates(),
    ),
  );

  return { emitter };
}
