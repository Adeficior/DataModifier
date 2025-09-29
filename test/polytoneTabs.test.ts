import { describe, expect, it } from 'vitest'
import createTestAcceptor from './mock/TestAcceptor.js'
import setupLoader from './shared/loaderSetup.js'

const { loader } = setupLoader({ load: false, hideFrom: ['polytone'] })

describe('creates addition entries', () => {
   it('emits per tab key', async () => {
      const acceptor = createTestAcceptor()

      loader.tabs.add(
         ['something:test_tab', { namespace: 'example', path: 'food' }],
         ['minecraft:diamond', { namespace: 'forge', path: 'the_logo' }]
      )

      await loader.emit(acceptor)

      expect(acceptor.at('assets/something/polytone/creative_tab_modifiers/test_tab.json')).toMatchSnapshot(
         'addition modifier 2'
      )
      expect(acceptor.at('assets/example/polytone/creative_tab_modifiers/food.json')).toMatchSnapshot(
         'addition modifier 1'
      )
   })

   it('adds after predicate', async () => {
      const acceptor = createTestAcceptor()

      loader.tabs.add('example:tab', ['minecraft:oak_log'], { after: 'minecraft:stone_axe' })

      await loader.emit(acceptor)

      expect(acceptor.at('assets/example/polytone/creative_tab_modifiers/tab.json')).toMatchSnapshot(
         'addition modifier with after predicate'
      )
   })

   it('adds before predicate', async () => {
      const acceptor = createTestAcceptor()

      loader.tabs.add('example:tab', ['minecraft:oak_planks'], { before: 'minecraft:stone_hoe' })

      await loader.emit(acceptor)

      expect(acceptor.at('assets/example/polytone/creative_tab_modifiers/tab.json')).toMatchSnapshot(
         'addition modifier with after predicate'
      )
   })
})

describe('create removal entries', () => {
   it('resolves filter correctly', async () => {
      const acceptor = createTestAcceptor()

      loader.tabs.remove(
         ['something:test_tab', { namespace: 'example', path: 'food' }],
         ['minecraft:diamond', { namespace: 'forge', path: 'the_logo' }]
      )

      await loader.emit(acceptor)

      expect(acceptor.at('assets/something/polytone/creative_tab_modifiers/test_tab.json')).toMatchSnapshot(
         'removal modifier 2'
      )
      expect(acceptor.at('assets/example/polytone/creative_tab_modifiers/food.json')).toMatchSnapshot(
         'removal modifier 1'
      )
   })
})

describe('create new tabs', () => {
   it('emits and mergers csv', async () => {
      const acceptor = createTestAcceptor()

      loader.tabs.create('something:test_tab')
      loader.tabs.create('something:another_tab')
      loader.tabs.create('minecraft:more_blocks')

      await loader.emit(acceptor)

      expect(acceptor.at('assets/something/polytone/creative_tabs.csv')).toMatchSnapshot('tab csv 1 for something')
      expect(acceptor.at('assets/minecraft/polytone/creative_tabs.csv')).toMatchSnapshot('tab csv for minecraft')
   })
})
