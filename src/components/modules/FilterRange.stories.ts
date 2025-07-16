import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FilterRange from './FilterRange.vue'
import { Facet, Filter } from '@/models'

/**
 * FilterRange component allows users to filter data by a numeric range using a histogram slider.
 * It displays a histogram of the data distribution and lets users select a range.
 */
const meta = {
  title: 'Modules/FilterRange',
  component: FilterRange,
  tags: ['autodocs'],
  argTypes: {
    facet: {
      description: 'The facet object containing buckets and type information',
      control: 'object'
    },
    facetFilters: {
      description: 'Array of applied filters',
      control: 'object'
    },
    onChanged: {
      description: 'Event emitted when filters are applied or reset',
      action: 'changed'
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof FilterRange>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default story with year range data
 */
export const Default: Story = {
  render: args => ({
    components: { FilterRange },
    setup() {
      const facetFilters = ref(args.facetFilters || [])

      const handleChanged = (filters: Filter[]) => {
        facetFilters.value = filters
        args.onChanged(filters)
      }

      return { args, facetFilters, handleChanged }
    },
    template: `
      <div style="width: 300px;">
        <FilterRange 
          :facet="args.facet" 
          :facetFilters="facetFilters"
          @changed="handleChanged" 
        />
      </div>
    `
  }),
  args: {
    facet: {
      type: 'year',
      buckets: Array.from({ length: 11 }, (_, i) => ({
        val: 1900 + i * 10,
        count: Math.floor(Math.random() * 1000) + 100
      }))
    } as Facet,
    facetFilters: [] as Filter[]
  }
}

/**
 * With pre-selected range
 */
export const WithPreselectedRange: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: {
      type: 'year',
      buckets: Array.from({ length: 11 }, (_, i) => ({
        val: 1900 + i * 10,
        count: Math.floor(Math.random() * 1000) + 100
      }))
    } as Facet,
    facetFilters: [
      {
        type: 'year',
        q: ['1920', '1960']
      } as Filter
    ]
  }
}

/**
 * Page count range filter
 */
export const PageCountRange: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: {
      type: 'pageCount',
      buckets: Array.from({ length: 10 }, (_, i) => ({
        val: i + 1,
        count: Math.floor(Math.random() * 500) + 50
      }))
    } as Facet,
    facetFilters: []
  }
}

/**
 * With many buckets
 */
export const WithManyBuckets: Story = {
  ...Default,
  args: {
    ...Default.args,
    facet: {
      type: 'year',
      buckets: Array.from({ length: 100 }, (_, i) => ({
        val: 1900 + i,
        count: Math.floor(Math.random() * 200) + 10
      }))
    } as Facet,
    facetFilters: []
  }
}
