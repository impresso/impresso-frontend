import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Entity, FilterWithItems } from '@/models'
import FilterLabel from './FilterLabel.vue'
import type { FilterAsLabelProps } from './FilterLabel.vue'

type FilterLabelStoryItem = Entity & {
  name?: string
}

const pageFilter: FilterWithItems<FilterLabelStoryItem> = {
  context: 'include',
  op: 'OR',
  type: 'page',
  q: ['1', '3'],
  items: [
    { id: '1', label: '1', name: '1' },
    { id: '3', label: '3', name: '3' }
  ]
}

const excludedPageFilter: FilterWithItems<FilterLabelStoryItem> = {
  context: 'exclude',
  op: 'AND',
  type: 'page',
  q: ['5'],
  items: [{ id: '5', label: '5', name: '5' }]
}

const meta = {
  title: 'Modules/lists/FilterLabel',
  component: FilterLabel,
  tags: ['autodocs'],
  render: args => ({
    components: { FilterLabel },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 16px; text-align: start;">
        <FilterLabel v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof FilterLabel>

export default meta
type Story = StoryObj<typeof meta>

export const PageFilter: Story = {
  args: {
    filter: pageFilter
  } as FilterAsLabelProps
}

export const ExcludedPageFilter: Story = {
  args: {
    filter: excludedPageFilter
  } as FilterAsLabelProps
}
export const WithManyItems: Story = {
  args: {
    filter: {
      context: 'include',
      op: 'OR',
      type: 'page',
      q: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    } as FilterWithItems<FilterLabelStoryItem>,
    limitNumberOfFilterItems: 5
  } as FilterAsLabelProps
}
