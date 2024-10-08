import type { Meta, StoryObj } from '@storybook/vue3'
import FilterFacet from '@/components/modules/FilterFacet.vue'
import type { Facet } from '@/models'

interface CompType {
  primary?: boolean, lazy?: boolean, facet?: any,
}

const meta: Meta<CompType> = {
  title: 'Components/Modules/FilterFacet',
  component: FilterFacet,
  tags: ['autodocs'],
  argTypes: {
    lazy: { control: 'check' },
  },
  args: { primary: false } as any, // default value
} satisfies Meta<typeof FilterFacet>;

export default meta
type Story = StoryObj<typeof meta>

const generateFacetWithBuckets = (numBuckets: number, totalBuckets?: number): Facet => ({
  buckets: Array.from({ length: numBuckets }, (_, i) => ({
    val: `bucket-${i}`,
    item: {
      uid: `bucket-${i}`,
      label: `Bucket ${i}`,
      name: `Bucket ${i}`,
      language: 'English',
      htmlExcerpt: `Bucket ${i}`,
    },
    count: 1,
  })),
  type: 'topic',
  numBuckets: totalBuckets ?? numBuckets,
})

export const NoBuckets: Story = {
  args: {
    facet: generateFacetWithBuckets(0),
  },
}

export const OneBuckets: Story = {
  args: {
    facet: generateFacetWithBuckets(1),
  },
}

export const MultipleBucketsAllLoaded: Story = {
  args: {
    facet: generateFacetWithBuckets(9),
  },
}

export const MultipleBucketsPartiallyLoaded: Story = {
  args: {
    facet: generateFacetWithBuckets(9, 19),
  },
}
