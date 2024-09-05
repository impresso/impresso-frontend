import type { Meta, StoryObj } from '@storybook/vue3'
import FilterDynamicRange, {
  type StatsDataProvider,
  type FacetSearchDataProvider
} from '@/components/modules/FilterDynamicRange.vue'
import type { Facet } from '@/models'
import { fn } from '@storybook/test'

const statsProvider: StatsDataProvider = async (type: string, { query }) => {
  return Promise.resolve({
    statistics: {
      min: 0,
      max: 100
    },
    total: 100
  })
}

const generateFacetWithBuckets = (numBuckets: number, totalBuckets?: number): Facet => ({
  buckets: Array.from({ length: numBuckets }, (_, i) => ({
    val: `bucket-${i}`,
    count: Math.floor(Math.random() * 100),
    upper: i + 1,
    lower: i
  })),
  type: 'textReuseClusterSize',
  numBuckets: totalBuckets ?? numBuckets
})

const facetSearchProvider = (index: string): FacetSearchDataProvider => {
  return async (type: string, { query }) => {
    return generateFacetWithBuckets(100, 300)
  }
}

const noUpperLowerFacetSearchProvider = (index: string): FacetSearchDataProvider => {
  return async (type: string, { query }) => {
    const facet = generateFacetWithBuckets(100, 300)
    facet.buckets.forEach(bucket => {
      delete bucket['upper']
      delete bucket['lower']
    })
    return facet
  }
}

const meta: Meta = {
  title: 'Components/Modules/FilterDynamicRange',
  component: FilterDynamicRange,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    statsProvider,
    facetSearchProvider,
    facetType: 'textReuseClusterSize',
    onClicked: fn(),
    onChanged: fn()
  }
} satisfies Meta<typeof FilterDynamicRange>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}

export const NoUpperLower: Story = {
  args: {
    facetSearchProvider: noUpperLowerFacetSearchProvider
  }
}
