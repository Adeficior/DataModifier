import type { InferIds, RegistryId } from "@adeficior/data-modifier/generated";
import type { Acceptor, Logger } from "@adeficior/pack-resolver";
import { arrayOrSelf } from "@adeficior/pack-resolver";
import { uniq } from "lodash-es";
import type { NormalizedId } from "../common/id.js";
import { encodeId } from "../common/id.js";

import type { IngredientTest } from "../common/ingredient/filter.js";
import resolveIngredientTest from "../common/ingredient/filter.js";
import {
  BlockIngredient,
  FluidIngredient,
  ItemIngredient,
  ListIngredient,
} from "../common/ingredient/index.js";
import { IllegalShapeError } from "../error.js";
import type { PackContext } from "../loader/context.js";
import { toJson } from "../textHelper.js";
import type { ClearableEmitter } from "./index.js";

export type HideMode = "jei" | "polytone";
export interface BlacklistOptions {
  hideFrom?: HideMode | HideMode[];
}

export interface BlacklistRules {
  hide(...inputs: IngredientTest[]): void;
  hideEntry<T extends RegistryId>(
    type: T,
    ...entries: RegistryIdInput<T>[]
  ): void;
}

type RegistryIdInput<T extends RegistryId> = InferIds<T> | RegExp;

export default class BlacklistEmitter
  implements BlacklistRules, ClearableEmitter
{
  private hidden: NormalizedId[] = [];
  private readonly hideModes: HideMode[];

  constructor(
    private readonly logger: Logger,
    private readonly context: PackContext,
    options: BlacklistOptions,
  ) {
    this.hideModes = arrayOrSelf(options.hideFrom);
  }

  hide(...inputs: IngredientTest[]) {
    this.hidden.push(
      ...inputs.flatMap((test) => this.resolveIds(test)).map(encodeId),
    );
  }

  hideEntry<T extends RegistryId>(type: T, ...entries: RegistryIdInput<T>[]) {
    const ids = entries
      .flatMap((entry) => {
        if (typeof entry === "string") {
          this.context.lookup.validateEntry(type, entry);
          return [entry];
        } else {
          const keys = this.context.lookup.keys(type);
          if (!keys)
            throw new Error(
              `cannot hide using regex/predicates, registry ${encodeId(
                type,
              )} not loaded`,
            );
          return [...keys].filter((it) => entry.test(it));
        }
      })
      .map(encodeId);

    this.hidden.push(...ids);
  }

  private filterIds(test: IngredientTest) {
    const keys = this.context.lookup.keys("minecraft:item");
    if (!keys)
      throw new Error(
        "you can only use regex/predicates to blacklist items if a registry dump is loaded",
      );
    const predicate = resolveIngredientTest(test, this.context);

    return [...keys.keys()].filter((it) => predicate(it, this.logger));
  }

  private resolveIds(input: IngredientTest): string[] {
    if (input instanceof RegExp || typeof input === "function") {
      return this.filterIds(input);
    }

    const ingredient = this.context.ingredients.create(input);

    if (ingredient instanceof ListIngredient) {
      return ingredient.entries.flatMap((it) => this.resolveIds(it));
    }

    // TODO common super class?
    if (
      ingredient instanceof BlockIngredient ||
      ingredient instanceof FluidIngredient ||
      ingredient instanceof ItemIngredient
    ) {
      return [encodeId(ingredient.id)];
    }

    throw new IllegalShapeError("illegal blacklist entry", input);
  }

  async emit(acceptor: Acceptor) {
    const hiddenIds = uniq(this.hidden).sort();
    if (hiddenIds.length === 0) return;

    const promises: Promise<void>[] = [];
    if (this.hideModes.includes("jei"))
      promises.push(this.emitJei(acceptor, hiddenIds));
    if (this.hideModes.includes("polytone"))
      promises.push(this.emitPolytone(acceptor, hiddenIds));
    await Promise.all(promises);
  }

  private async emitJei(acceptor: Acceptor, hiddenIds: NormalizedId[]) {
    const content = hiddenIds.join("\n");
    const path = "jei/blacklist.cfg";
    acceptor(path, content);
  }

  private async emitPolytone(acceptor: Acceptor, hiddenIds: NormalizedId[]) {
    const tabs = this.context.lookup.keys("minecraft:creative_mode_tab");

    if (!tabs)
      throw new Error(
        "Cannot use polytone output without creative mod tab registry",
      );

    const content = await toJson({
      targets: [...tabs.values()],
      removals: [
        {
          type: "items_match",
          items: hiddenIds,
        },
      ],
    });

    const path = "assets/generated/polytone/creative_tab_modifiers/hidden.json";
    acceptor(path, content);
  }

  clear() {
    this.hidden = [];
  }
}
