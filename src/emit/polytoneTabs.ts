import type {
  CreativeModeTabId,
  ItemId,
} from "@adeficior/data-modifier/generated";
import type { Acceptor } from "@adeficior/pack-resolver";
import { arrayOrSelf } from "@adeficior/pack-resolver";
import { difference, uniq } from "lodash-es";
import type { IdInput, NormalizedId } from "../common/id.js";
import { createId, encodeId } from "../common/id.js";
import type RegistryLookup from "../loader/registry/index.js";
import CustomEmitter from "./custom.js";
import type { ClearableEmitter } from "./index.js";

interface TabModifications {
  icon?: IdInput<ItemId>;
  can_scroll?: boolean;
  show_title?: boolean;
  search_bar?: boolean;
  before_tabs?: IdInput<CreativeModeTabId>[];
  after_tabs?: IdInput<CreativeModeTabId>[];
  name?: string;
}

interface TabOptions {
  file?: IdInput;
  mods?: string[];
}

interface TabOptionsWithAfter extends TabOptions {
  after: IdInput<ItemId>;
}

interface TabOptionsWithBefore extends TabOptions {
  before: IdInput<ItemId>;
}

type AddOptions = TabOptionsWithAfter | TabOptionsWithBefore | TabOptions;

export interface PolytoneTabs {
  remove(
    tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[],
    items: IdInput<ItemId>[],
    options?: TabOptions,
  ): void;
  add(
    tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[],
    items: IdInput<ItemId>[],
    options?: AddOptions,
  ): void;
  create(id: IdInput, options?: TabModifications): CreativeModeTabId;
  modify(id: IdInput, options: TabModifications): void;
}

interface ItemsMatchPredicate {
  type: "items_match";
  items: NormalizedId<ItemId>[];
}

type PolytonePredicate = ItemsMatchPredicate;

interface AdditionEntry {
  items: ItemId[];
  before?: boolean;
  inverse?: boolean;
  predicate?: PolytonePredicate;
}

export interface PolytoneTabModifier extends TabModifications {
  icon?: NormalizedId<ItemId>;
  before_tabs?: NormalizedId<CreativeModeTabId>[];
  after_tabs?: NormalizedId<CreativeModeTabId>[];
  targets: NormalizedId<CreativeModeTabId>[];
  removals?: PolytonePredicate[];
  additions?: AdditionEntry[];
  require_mods?: string[];
}

function translateModifications({
  icon,
  after_tabs,
  before_tabs,
  ...modifications
}: TabModifications): Omit<PolytoneTabModifier, "targets"> {
  return {
    ...modifications,
    before_tabs: arrayOrSelf(before_tabs).map(encodeId),
    after_tabs: arrayOrSelf(after_tabs).map(encodeId),
    icon: icon !== undefined ? encodeId(icon) : undefined,
  };
}

function mergeModifiers(
  a: PolytoneTabModifier,
  b: PolytoneTabModifier,
): PolytoneTabModifier {
  const diff = difference(a.targets, b.targets);
  if (diff.length)
    throw new Error("trying to merge modifiers with different targets");
  return {
    ...a,
    ...b,
    targets: uniq([...a.targets, ...b.targets]),
    additions: [...(a.additions ?? []), ...(b.additions ?? [])],
    removals: [...(a.removals ?? []), ...(b.removals ?? [])],
  };
}

function translateOptions(options: AddOptions = {}): Partial<AdditionEntry> {
  if ("before" in options && options.before) {
    return {
      before: true,
      predicate: {
        items: [encodeId(options.before)],
        type: "items_match",
      },
    };
  } else if ("after" in options && options.after) {
    return {
      before: false,
      predicate: {
        items: [encodeId(options.after)],
        type: "items_match",
      },
    };
  } else {
    return {};
  }
}

export default class PolytoneTabsEmitter
  implements PolytoneTabs, ClearableEmitter
{
  private readonly entries = new CustomEmitter<PolytoneTabModifier>(
    (id) =>
      `assets/${id.namespace}/polytone/creative_tab_modifiers/${id.path}.json`,
  );

  private readonly tabs = new CustomEmitter<string[]>(
    (id) => `assets/${id.namespace}/polytone/creative_tabs.csv`,
    (it) => it.join(","),
  );

  constructor(private readonly lookup: () => RegistryLookup) {}

  clear(): void {
    this.entries.clear();
    this.tabs.clear();
  }

  async emit(acceptor: Acceptor) {
    await Promise.all([this.entries.emit(acceptor), this.tabs.emit(acceptor)]);
  }

  remove(
    tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[],
    items: IdInput<ItemId>[],
    options: TabOptions = {},
  ) {
    this.forEach(
      tab,
      {
        removals: [{ type: "items_match", items: items.map(encodeId) }],
      },
      options,
    );
  }

  add(
    tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[],
    items: IdInput<ItemId>[],
    options: AddOptions = {},
  ) {
    this.forEach(
      tab,
      {
        additions: [
          { items: items.map(encodeId), ...translateOptions(options) },
        ],
      },
      options,
    );
  }

  create(id: IdInput, modifications: TabModifications = {}) {
    const lookup = this.lookup();
    const { namespace, path } = createId(id);
    this.tabs.merge({ namespace, path: "tab" }, [path], (a, b) =>
      uniq([...a, ...b]),
    );
    if (Object.keys(modifications).length) {
      this.modify(id, modifications);
    }
    return lookup.addCustom("minecraft:creative_mode_tab", id);
  }

  modify(id: IdInput, modifications: TabModifications) {
    this.entries.merge(
      id,
      {
        ...translateModifications(modifications),
        targets: [encodeId(id)],
      },
      mergeModifiers,
    );
  }

  private forEach(
    tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[],
    modifier: Omit<PolytoneTabModifier, "targets">,
    options: TabOptions,
  ) {
    arrayOrSelf(tab).forEach((target) => {
      const file = options.file ?? target;
      const entry: PolytoneTabModifier = {
        targets: [encodeId(target)],
        require_mods: options.mods,
        ...modifier,
      };
      this.entries.merge(file, entry, mergeModifiers);
    });
  }
}
