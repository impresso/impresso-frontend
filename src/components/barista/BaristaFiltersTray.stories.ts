import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import BaristaFiltersTray from './BaristaFiltersTray.vue'
import type { BaristaFiltersTrayProps } from './BaristaFiltersTray.vue'
import {
  MockBaristaSearchFilters,
  MockBaristaSuggestedFilters,
  MockBaristaSuggestedFiltersWithItems
} from '.storybook/mockData/baristaFilters'

/**
 * Filters built by Barista, shared by the full (`panel`) and the compact (`bar`) Barista views.
 * It tells the user what applying the filters changes compared to the current search.
 */
const meta: Meta<typeof BaristaFiltersTray> = {
  title: 'Barista/BaristaFiltersTray',
  component: BaristaFiltersTray,
  tags: ['autodocs'],
  args: {
    suggestedFilters: MockBaristaSuggestedFilters,
    filtersWithItems: MockBaristaSuggestedFiltersWithItems,
    currentFilters: MockBaristaSearchFilters,
    onChanged: fn(),
    onApply: fn()
  },
  render: args => ({
    components: { BaristaFiltersTray },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 21.5rem; height: 420px; padding: 1rem; border: 1px solid var(--clr-grey-600); border-radius: var(--border-radius-md)">
        <BaristaFiltersTray v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Panel: Story = {
  args: { variant: 'panel' } as BaristaFiltersTrayProps
}

export const PanelMatchingSearch: Story = {
  args: {
    variant: 'panel',
    currentFilters: MockBaristaSuggestedFilters
  } as BaristaFiltersTrayProps
}

export const PanelEmpty: Story = {
  args: {
    variant: 'panel',
    suggestedFilters: [],
    filtersWithItems: []
  } as BaristaFiltersTrayProps
}

export const Bar: Story = {
  args: { variant: 'bar' } as BaristaFiltersTrayProps
}

export const BarOpen: Story = {
  args: { variant: 'bar', defaultOpen: true } as BaristaFiltersTrayProps
}
