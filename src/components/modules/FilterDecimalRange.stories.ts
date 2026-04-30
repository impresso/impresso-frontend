import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Filter } from '@/models'
import FilterDecimalRange from './FilterDecimalRange.vue'
import type {
  DecimalFacetSearchQueryParameters,
  FilterDecimalRangeProps,
  StatsDataProvider
} from './FilterDecimalRange.vue'

const mockStatsProvider: StatsDataProvider = async () => {
  await new Promise(resolve => setTimeout(resolve, 150))
  return {
    statistics: {
      min: 0,
      max: 1
    },
    total: 128
  }
}

const mockFacetSearchProvider = () => {
  return async (_type: string, params: { query: DecimalFacetSearchQueryParameters }) => {
    await new Promise(resolve => setTimeout(resolve, 150))

    const values: number[] = []
    for (let v = params.query.rangeStart; v <= params.query.rangeEnd; v += params.query.rangeGap) {
      values.push(Number(v.toFixed(2)))
    }

    return {
      type: 'textReuseClusterLexicalOverlap',
      buckets: values
        .filter(value => value >= 0 && value <= 1)
        .map((value, index) => ({
          value,
          count: Math.max(1, 30 - Math.abs(20 - index))
        }))
    } as any
  }
}

const meta: Meta<typeof FilterDecimalRange> = {
  title: 'modules/FilterDecimalRange',
  component: FilterDecimalRange,
  tags: ['autodocs'],
  render: args => ({
    components: { FilterDecimalRange },
    setup() {
      const onChanged = (filters: Filter[]) => {
        console.info('changed', filters)
      }
      const onClicked = (filter: Filter) => {
        console.info('clicked', filter)
      }
      return { args, onChanged, onClicked }
    },
    template: `
      <div style="width: 440px; padding: 16px;">
        <FilterDecimalRange
          v-bind="args"
          @changed="onChanged"
          @clicked="onClicked"
        />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const LexicalOverlap: Story = {
  args: {
    facetType: 'textReuseClusterLexicalOverlap',
    facetFilters: [],
    isFiltered: false,
    index: 'tr_passages',
    isPercentage: true,
    precision: 2,
    minValue: 0,
    maxValue: 1,
    rangeStep: 0.01,
    countLabel: 'numbers.passages',
    valuePercentageLabel: 'textReuseClusterLexicalOverlapValuePercentageLabel',
    statsProvider: mockStatsProvider,
    facetSearchProvider: mockFacetSearchProvider
  } as FilterDecimalRangeProps
}
