import type { Meta, StoryObj } from '@storybook/vue3'
import SourcesOverviewTimeline from './SourcesOverviewTimeline.vue'

const meta: Meta<typeof SourcesOverviewTimeline> = {
  title: 'SourceOverview/Timeline',
  component: SourcesOverviewTimeline,
  render: args => ({
    components: { SourcesOverviewTimeline },
    setup() {
      return { args }
    },
    template:
      '<SourcesOverviewTimeline v-bind="args" style="height: 500px; border: 1px solid purple" />'
  }),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A timeline component that displays a year-based timeline with configurable date ranges and minimum gap between ticks.'
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
    minimumGap: {
      control: { type: 'number', min: 10, max: 100, step: 5 },
      description: 'Minimum distance in pixels between ticks'
    }
  },
  args: {
    startDate: new Date('1700-01-01'),
    endDate: new Date('2030-12-31'),
    minimumGap: 10
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: [
      {
        id: '1',
        date: new Date('1850-01-01'),
        dateRange: [new Date('1850-01-01'), new Date('1850-12-31')],
        label: 'Example from 1850',
        value: 30
      },
      {
        id: '2',
        date: new Date('1880-01-08'),
        dateRange: [new Date('1875-01-08'), new Date('1875-01-09')],
        label: 'Example from 1880',
        value: 35
      }
    ],
    minimumGap: 8
  }
}

export const ManyItems: Story = {
  args: {
    startDate: new Date('1800-01-01'),
    endDate: new Date('1900-12-31'),
    dataValues: Array.from({ length: 50 }, (_, i) => ({
      id: (i + 1).toString(),
      date: new Date(
        `18${Math.floor(Math.random() * 100)
          .toString()
          .padStart(2, '0')}-01-01`
      ),
      dateRange: [
        new Date(
          `18${Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, '0')}-01-01`
        ),
        new Date(
          `18${Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, '0')}-12-31`
        )
      ],
      label: `Example ${i + 1}`,
      value: Math.floor(Math.random() * 100)
    })),
    minimumGap: 10
  }
}
