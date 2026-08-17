import type { LoaderContext, SemVerInput } from "@adeficior/data-modifier-core";
import { CombinedEmitters, packFormatOf } from "@adeficior/data-modifier-core";
import {
  mockRegistryLookup,
  mockRegistryProvider,
} from "@adeficior/data-modifier-core/testing";
import { mockPredicates } from "@adeficior/data-modifier-ingredients/testing";
import type { Resolver } from "@adeficior/pack-resolver";
import { LootTableEmitter } from "../../../loot/src/emitter";
import { BlockstateEmitterImpl } from "../../../models/src/emitter/blockstates";
import { ModelEmitterImpl } from "../../../models/src/emitter/models";
import { BlockDefinitionEmitter } from "../../src/emitter/blockDefinition";
import { ItemDefinitionEmitter } from "../../src/emitter/itemDefinition";

// TODO move to testing package and use in recipes
type ExternalResolver<T> = {
  emitter: Omit<T, "resolver">;
  resolver: Resolver;
  reset: () => void;
};

export function createBlockDefinitionEmitter(
  version: SemVerInput,
  context: LoaderContext,
): ExternalResolver<BlockDefinitionEmitter> {
  // TODO mock instead?
  const emitters = new CombinedEmitters();
  const blockModels = emitters.add(new ModelEmitterImpl("block"));
  const blockStates = emitters.add(new BlockstateEmitterImpl());
  const loot = emitters.add(
    new LootTableEmitter(
      packFormatOf(version),
      mockRegistryProvider(),
      mockRegistryLookup(),
      mockPredicates(),
    ),
  );

  const emitter = emitters.add(
    new BlockDefinitionEmitter(blockModels, blockStates, loot),
  );

  const resolver = emitters.resolver(context);
  const reset = () => emitter.clear();

  return { emitter, resolver, reset };
}

export function createItemDefinitionEmitter(
  version: SemVerInput,
  context: LoaderContext,
): ExternalResolver<ItemDefinitionEmitter> {
  // TODO mock instead?
  const emitters = new CombinedEmitters();
  const itemModels = emitters.add(new ModelEmitterImpl("item"));
  const blockModels = emitters.add(new ModelEmitterImpl("block"));
  const blockStates = emitters.add(new BlockstateEmitterImpl());
  const loot = emitters.add(
    new LootTableEmitter(
      packFormatOf(version),
      mockRegistryProvider(),
      mockRegistryLookup(),
      mockPredicates(),
    ),
  );

  const emitter = emitters.add(
    new ItemDefinitionEmitter(
      // TODO mock instead?
      itemModels,
      blockModels,
      blockStates,
      loot,
    ),
  );

  const resolver = emitters.resolver(context);
  const reset = () => emitter.clear();

  return { emitter, resolver, reset };
}
