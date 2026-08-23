import type { IdInput } from "@adeficior/data-modifier-core";
import type { LootEmitter } from "@adeficior/data-modifier-loot";
import type {
  BlockstateEmitter,
  ModelEmitter,
} from "@adeficior/data-modifier-models";
import type { BlockDefinition } from "../schema/blockDefinition";
import type { BlockDefinitionEmitter } from "./blockDefinition";
import { AbstractBlockDefinitionEmitter } from "./blockDefinition";

/* eslint-disable @typescript-eslint/no-explicit-any */

class InnerBlockDefinitionEmitter extends AbstractBlockDefinitionEmitter {
  add<T extends BlockDefinition>(id: IdInput | T, definition?: T): T {
    return definition ?? (id as T);
  }
}

type CurriedFunction<TRest extends unknown[], TReturn> = (
  ...args: TRest
) => TReturn;
type InferCurriedFunction<T> = T extends (
  sliced: any,
  ...args: infer TRest
) => infer TReturn
  ? CurriedFunction<TRest, TReturn>
  : never;

function curry<
  T extends (sliced: TSliced, ...args: TRest) => TReturn,
  TSliced,
  TRest extends any[],
  TReturn,
>(func: T, dummy: TSliced) {
  return function (this: unknown, ...args: TRest) {
    return func.call(this, dummy, ...args);
  } as InferCurriedFunction<T>;
}

export type BlockDefinitionEmitterWithoutId = {
  [K in keyof BlockDefinitionEmitter]: InferCurriedFunction<
    BlockDefinitionEmitter[K]
  >;
};

/**
 * Modifies emitter
 */
function createCurriedEmitter(id: IdInput, emitter: BlockDefinitionEmitter) {
  const methods = Object.getOwnPropertyNames(
    AbstractBlockDefinitionEmitter.prototype,
  ).filter((it) => it !== "constructor") as Array<
    keyof AbstractBlockDefinitionEmitter
  >;

  const out = emitter as any;

  methods.forEach((key) => {
    const func = emitter[key];
    if (typeof func === "function") {
      out[key] = curry(func, id).bind(emitter);
    }
  });

  return out as BlockDefinitionEmitterWithoutId;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export function createInnerBlockDefinitionBuilder(
  id: IdInput,
  models: ModelEmitter,
  blockstates: BlockstateEmitter,
  loot: LootEmitter,
) {
  const inner = new InnerBlockDefinitionEmitter(models, blockstates, loot);
  return createCurriedEmitter(id, inner);
}
