import { CreativeModeTabId, ItemId } from '@pssbletrngle/data-modifier/generated'
import { Acceptor, arrayOrSelf } from '@pssbletrngle/pack-resolver'
import { difference, uniq } from 'lodash-es'
import { createId, encodeId, IdInput, NormalizedId } from '../common/id.js'
import RegistryLookup from '../loader/registry/index.js'
import CustomEmitter from './custom.js'
import { ClearableEmitter } from './index.js'

type AddOptions =
   | {
        after: IdInput<ItemId>
     }
   | {
        before: IdInput<ItemId>
     }

export interface PolytoneTabs {
   remove(tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[], items: IdInput<ItemId>[]): void
   add(
      tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[],
      items: IdInput<ItemId>[],
      options?: AddOptions
   ): void
   create(id: IdInput): void
}

interface ItemsMatchPredicate {
   type: 'items_match'
   items: NormalizedId<ItemId>[]
}

type PolytonePredicate = ItemsMatchPredicate

interface AdditionEntry {
   items: ItemId[]
   before?: boolean
   inverse?: boolean
   predicate?: PolytonePredicate
}

export interface PolytoneTabModifier {
   targets: NormalizedId<CreativeModeTabId>[]
   removals?: PolytonePredicate[]
   additions?: AdditionEntry[]
}

function mergeModifiers(a: PolytoneTabModifier, b: PolytoneTabModifier): PolytoneTabModifier {
   const diff = difference(a.targets, b.targets)
   if (diff.length) throw new Error('trying to merge modifiers with different targets')
   return {
      targets: uniq([...a.targets, ...b.targets]),
      additions: [...(a.additions ?? []), ...(b.additions ?? [])],
      removals: [...(a.removals ?? []), ...(b.removals ?? [])],
   }
}

function translateOptions(options?: AddOptions): Partial<AdditionEntry> {
   if (!options) return {}
   const before = 'before' in options
   const item = before ? options.before : options.after
   return {
      before,
      predicate: {
         items: [encodeId(item)],
         type: 'items_match',
      },
   }
}

export default class PolytoneTabsEmitter implements PolytoneTabs, ClearableEmitter {
   private readonly entries = new CustomEmitter<PolytoneTabModifier>(
      id => `assets/${id.namespace}/polytone/creative_tab_modifiers/${id.path}.json`
   )

   private readonly tabs = new CustomEmitter<string[]>(
      id => `assets/${id.namespace}/polytone/creative_tabs.csv`,
      it => it.join(',')
   )

   constructor(private readonly lookup: () => RegistryLookup) {}

   clear(): void {
      this.entries.clear()
      this.tabs.clear()
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([this.entries.emit(acceptor), this.tabs.emit(acceptor)])
   }

   remove(tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[], items: IdInput<ItemId>[]) {
      this.forEach(tab, {
         removals: [{ type: 'items_match', items: items.map(encodeId) }],
      })
   }

   add(tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[], items: IdInput<ItemId>[], options?: AddOptions) {
      this.forEach(tab, {
         additions: [{ items: items.map(encodeId), ...translateOptions(options) }],
      })
   }

   create(id: IdInput): void {
      const lookup = this.lookup()
      lookup.addCustom('minecraft:creative_mode_tab', id)
      const { namespace, path } = createId(id)
      this.tabs.merge({ namespace, path: 'tab' }, [path], (a, b) => uniq([...a, ...b]))
   }

   private forEach(
      tab: IdInput<CreativeModeTabId> | IdInput<CreativeModeTabId>[],
      modifier: Omit<PolytoneTabModifier, 'targets'>
   ) {
      arrayOrSelf(tab).forEach(target => {
         const entry: PolytoneTabModifier = {
            targets: [encodeId(target)],
            ...modifier,
         }
         this.entries.merge(target, entry, mergeModifiers)
      })
   }
}
