import type { Meta, StoryObj } from '@storybook/vue3'
import FacetOverviewPanel from '../FacetOverviewPanel.vue'
import Bucket from '@/models/Bucket'
import { FacetType } from '@/models/Facet'

interface ComponentProps {
  hoverId?: string
  facet?: FacetType
  type?: 'timeline' | 'bars'
  values?: Bucket[]
  maxValues?: Bucket[]
  timelineHighlightValue?: { w: number; t: number }
  timelineHighlightEnabled?: boolean
  timelineDomain?: number[]
  isLoading?: boolean
  numBuckets?: number
}

const meta: Meta<ComponentProps> = {
  title: 'Components/Modules/SearchQueriesComparison/FacetOverviewPanel',
  component: FacetOverviewPanel,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['timeline', 'bars']
    },
    facet: {
      control: 'select',
      options: ['year', 'newspaper', 'language', 'topic', 'person', 'location']
    },
    isLoading: {
      control: 'boolean'
    },
    timelineHighlightEnabled: {
      control: 'boolean'
    }
  },
  args: {
    type: 'bars',
    facet: 'newspaper',
    isLoading: false,
    timelineHighlightEnabled: false
  },
  render: args => {
    return {
      components: { FacetOverviewPanel },
      setup() {
        return { args }
      },
      template: '<FacetOverviewPanel v-bind="args" />'
    }
  }
} satisfies Meta<typeof FacetOverviewPanel>

export default meta
type Story = StoryObj<typeof meta>

// Helper function to generate mock buckets
const generateBuckets = (type: string, count: number): Bucket[] => {
  return Array.from({ length: count }, (_, i) => new Bucket({
    val: type === 'year' ? `${2020 + i}` : `${type}-${i}`,
    count: Math.floor(Math.random() * 1000) + 10,
    type,
    item: {
      uid: `${type}-${i}`,
      name: type === 'year' ? `${2020 + i}` : `${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`,
      language: 'English'
    }
  }))
}

// Helper function to generate year buckets for timeline
const generateYearBuckets = (startYear: number, endYear: number): Bucket[] => {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => new Bucket({
    val: `${startYear + i}`,
    count: Math.floor(Math.random() * 500) + 50,
    type: 'year',
    item: {
      uid: `${startYear + i}`,
      name: `${startYear + i}`
    }
  }))
}

// Helper function to generate max buckets with higher counts
const generateMaxYearBuckets = (startYear: number, endYear: number): Bucket[] => {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => new Bucket({
    val: `${startYear + i}`,
    count: Math.floor(Math.random() * 1000) + 500, // Higher base counts for max values
    type: 'year',
    item: {
      uid: `${startYear + i}`,
      name: `${startYear + i}`
    }
  }))
}

export const BarsNewspapers: Story = {
  args: {
    type: 'bars',
    facet: 'newspaper',
    values: generateBuckets('newspaper', 5),
    numBuckets: 12
  }
}

export const BarsNewspapersLoading: Story = {
  args: {
    type: 'bars',
    facet: 'newspaper',
    values: generateBuckets('newspaper', 3),
    numBuckets: 10,
    isLoading: true
  }
}

export const BarsNewspapersAllLoaded: Story = {
  args: {
    type: 'bars',
    facet: 'newspaper',
    values: generateBuckets('newspaper', 8),
    numBuckets: 8
  }
}

export const BarsLanguages: Story = {
  args: {
    type: 'bars',
    facet: 'language',
    values: generateBuckets('language', 4),
    numBuckets: 6
  }
}

export const BarsTopics: Story = {
  args: {
    type: 'bars',
    facet: 'topic',
    values: generateBuckets('topic', 6),
    numBuckets: 15
  }
}

export const TimelineBasic: Story = {
  args: {
    type: 'timeline',
    facet: 'year',
    values: generateYearBuckets(2015, 2025),
    timelineDomain: [2015, 2025]
  }
}

export const TimelineWithHighlight: Story = {
  args: {
    type: 'timeline',
    facet: 'year',
    values: generateYearBuckets(2010, 2020),
    timelineDomain: [2010, 2020],
    timelineHighlightValue: { w: 150, t: 2015 },
    timelineHighlightEnabled: true
  }
}

export const TimelineShortRange: Story = {
  args: {
    type: 'timeline',
    facet: 'year',
    values: generateYearBuckets(2020, 2023),
    timelineDomain: [2020, 2023]
  }
}

export const BarsHovered: Story = {
  args: {
    type: 'bars',
    facet: 'newspaper',
    values: generateBuckets('newspaper', 5),
    numBuckets: 8,
    hoverId: 'newspaper-2'
  }
}

export const EmptyBars: Story = {
  args: {
    type: 'bars',
    facet: 'newspaper',
    values: [],
    numBuckets: 0
  }
}

export const EmptyTimeline: Story = {
  args: {
    type: 'timeline',
    facet: 'year',
    values: [],
    timelineDomain: []
  }
}

export const TimelineWithMaxValues: Story = {
  args: {
    type: 'timeline',
    facet: 'year',
    values: generateYearBuckets(2015, 2020),
    maxValues: generateMaxYearBuckets(2015, 2020),
    timelineDomain: [2015, 2020]
  }
}

export const TimelinePercentageMode: Story = {
  args: {
    type: 'timeline',
    facet: 'year',
    values: generateYearBuckets(2018, 2023),
    maxValues: generateMaxYearBuckets(2018, 2023),
    timelineDomain: [2018, 2023]
  },
  render: args => {
    return {
      components: { FacetOverviewPanel },
      setup() {
        return { args }
      },
      template: `
        <div>
          <p><strong>Note:</strong> Switch to "%" mode using the radio buttons to see percentage display based on maxValues</p>
          <FacetOverviewPanel v-bind="args" />
        </div>
      `
    }
  }
}