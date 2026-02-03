import type { Meta, StoryObj } from '@storybook/vue3'
import SourceOverviewMiniTimeline from './SourceOverviewMiniTimeline.vue'
import type { DataValue } from './SourcesOverviewDateValueItem.vue'

const MockDataValues: DataValue[] = Array.from({ length: 50 }, (_, i) => {
  const parentStartYear = 1800 + Math.floor(Math.random() * 100)
  const parentEndYear = parentStartYear + Math.floor(Math.random() * 20) + 5
  const parentStartDate = new Date(`${parentStartYear}-01-01`)
  const parentEndDate = new Date(`${parentEndYear}-12-31`)
  const parentRange = parentEndDate.getTime() - parentStartDate.getTime()

  return {
    id: (i + 1).toString(),
    date: new Date(parentStartDate.getTime() + Math.random() * parentRange),
    dateRange: [parentStartDate, parentEndDate],
    label: `Source ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 10,
    // nested datavalkues for drilldown
    dataValues: Array.from({ length: 5 }, (_, j) => {
      const childStartTime = parentStartDate.getTime() + Math.random() * (parentRange * 0.7)
      const childEndTime = childStartTime + Math.random() * (parentRange * 0.3)

      return {
        id: `${i + 1}-${j + 1}`,
        date: new Date(childStartTime + Math.random() * (childEndTime - childStartTime)),
        dateRange: [new Date(childStartTime), new Date(childEndTime)],
        label: `Source ${i + 1} - Detail ${j + 1}`,
        value: Math.floor(Math.random() * 100) + 10
      }
    })
  }
})

const meta: Meta<typeof SourceOverviewMiniTimeline> = {
  title: 'SourceOverview/MiniTimeline',
  component: SourceOverviewMiniTimeline,
  tags: ['autodocs'],
  render: args => ({
    components: { SourceOverviewMiniTimeline },
    setup() {
      return { args }
    },
    template: '<SourceOverviewMiniTimeline v-bind="args" />'
  }),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A lightweight SVG-based mini timeline component for displaying data values as a minimap without labels. Useful for navigation and overview of time-based data.'
      }
    }
  },
  argTypes: {
    startDate: {
      control: 'date',
      description: 'The starting date of the timeline'
    },
    endDate: {
      control: 'date',
      description: 'The ending date of the timeline'
    },
    containerWidth: {
      control: { type: 'number', min: 100, max: 1000, step: 50 },
      description: 'Width of the SVG container in pixels'
    },
    height: {
      control: { type: 'number', min: 50, max: 500, step: 50 },
      description: 'Height of the SVG container in pixels'
    },
    scaleExponent: {
      control: { type: 'number', min: 1, max: 5, step: 0.5 },
      description: 'Power scale exponent for value-based coloring'
    }
  },
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    containerWidth: 600,
    height: 150,
    scaleExponent: 4
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: MockDataValues,
    containerWidth: 600,
    height: 150,
    scaleExponent: 4
  }
}

export const Compact: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: MockDataValues,
    containerWidth: 300,
    height: 100,
    scaleExponent: 2
  }
}

export const WideFormat: Story = {
  args: {
    startDate: new Date('1700-01-01'),
    endDate: new Date('2000-12-31'),
    dataValues: MockDataValues,
    containerWidth: 800,
    height: 200,
    scaleExponent: 4
  }
}

export const LinearScale: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: MockDataValues,
    containerWidth: 600,
    height: 150,
    scaleExponent: 1
  }
}
