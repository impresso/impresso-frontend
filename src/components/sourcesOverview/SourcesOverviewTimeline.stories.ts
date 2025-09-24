import type { Meta, StoryObj } from '@storybook/vue3'
import SourcesOverviewTimeline from './SourcesOverviewTimeline.vue'

const meta: Meta<typeof SourcesOverviewTimeline> = {
  title: 'SourceOverview/Timeline',
  component: SourcesOverviewTimeline,
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
    startDate: new Date('1700-01-01'),
    endDate: new Date('2030-12-31'),
    dataValues: [
      { date: new Date('1750-01-01'), value: 10 },
      { date: new Date('1800-01-01'), value: 20 },
      {
        date: new Date('1850-01-01'),
        dateRange: [new Date('1850-01-01'), new Date('1850-12-31')],
        value: 30
      },
      {
        date: new Date('1880-01-08'),
        dateRange: [new Date('1875-01-08'), new Date('1875-01-09')],
        value: 35
      },
      { date: new Date('1900-01-01'), value: 40 },
      { date: new Date('1950-01-01'), value: 50 },
      { date: new Date('2000-01-01'), value: 60 },
      { date: new Date('2020-01-01'), value: 70 }
    ],
    minimumGap: 10
  }
}
