import {
  encodeId,
  type ClearableEmitter,
  type LoaderContext,
  type NormalizedId,
  type RegistryLookup,
} from "@adeficior/data-modifier-core";
import { toJson } from "@adeficior/data-modifier-core/serializer";
import {
  ItemIngredient,
  type IngredientFilter,
  type IngredientSerializer,
  type Predicates,
} from "@adeficior/data-modifier-ingredients";
import {
  type InferIds,
  type RegistryId,
} from "@adeficior/data-modifier/generated";
import {
  arrayOrSelf,
  simpleResolver,
  type DataConsumer,
} from "@adeficior/pack-resolver";
import { uniq } from "lodash-es";

export type HideMode = "jei" | "polytone";
export type BlacklistOptions = {
  hideFrom?: HideMode | HideMode[];
};

export interface BlacklistRules {
  hide(...inputs: IngredientFilter[]): void;
  hideEntry<T extends RegistryId>(
    type: T,
    ...entries: RegistryIdInput<T>[]
  ): void;
}

type RegistryIdInput<T extends RegistryId> = InferIds<T> | RegExp;

export class BlacklistEmitter implements BlacklistRules, ClearableEmitter {
  private hidden: NormalizedId[] = [];
  private readonly hideModes: HideMode[];

  constructor(
    private readonly registries: RegistryLookup,
    private readonly predicates: Predicates,
    private readonly ingredientSerializer: IngredientSerializer,
    options: BlacklistOptions,
  ) {
    this.hideModes = arrayOrSelf(options.hideFrom);
  }

  hide(...inputs: IngredientFilter[]) {
    this.hidden.push(
      ...inputs.flatMap((test) => this.resolveIds(test)).map(encodeId),
    );
  }

  hideEntry<T extends RegistryId>(type: T, ...entries: RegistryIdInput<T>[]) {
    const ids = entries
      .flatMap((entry) => {
        if (typeof entry === "string") {
          this.registries.validateEntry(type, entry);
          return [entry];
        } else {
          const keys = this.registries.keys(type);
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

  private filterItemIds(test: IngredientFilter) {
    const keys = this.registries.keys("minecraft:item");
    if (!keys)
      throw new Error(
        "you can only use regex/predicates to blacklist items if a registry dump is loaded",
      );

    const predicate = this.predicates.ingredient(test);

    return [...keys.keys()].filter((it) => predicate(new ItemIngredient(it)));
  }

  private resolveIds(input: IngredientFilter): string[] {
    if (input instanceof RegExp || typeof input === "function") {
      return this.filterItemIds(input);
    }

    const ingredient = this.ingredientSerializer.deserialize(input);

    return Object.values(ingredient.ids()).flat();
  }

  resolver(context: LoaderContext) {
    return simpleResolver(async (acceptor) => {
      const hiddenIds = uniq(this.hidden).sort();
      if (hiddenIds.length === 0) return;

      const promises: Promise<void>[] = [];
      if (this.hideModes.includes("jei"))
        promises.push(this.emitJei(acceptor, hiddenIds, context));
      if (this.hideModes.includes("polytone"))
        promises.push(this.emitPolytone(acceptor, hiddenIds, context));
      await Promise.all(promises);
    }, context);
  }

  private async emitJei(
    acceptor: DataConsumer,
    hiddenIds: NormalizedId[],
    context: LoaderContext,
  ) {
    const content = hiddenIds.join("\n");
    const path = "jei/blacklist.cfg";
    await acceptor(path, Promise.resolve(content), context);
  }

  private async emitPolytone(
    acceptor: DataConsumer,
    hiddenIds: NormalizedId[],
    context: LoaderContext,
  ) {
    const tabs = this.registries.keys("minecraft:creative_mode_tab");

    if (!tabs)
      throw new Error(
        "Cannot use polytone output without creative mod tab registry",
      );

    const content = toJson({
      targets: [...tabs.values()].toSorted(),
      removals: [
        {
          type: "items_match",
          items: hiddenIds,
        },
      ],
    });

    const path = "assets/generated/polytone/creative_tab_modifiers/hidden.json";
    await acceptor(path, content, context);
  }

  clear() {
    this.hidden = [];
  }
}
