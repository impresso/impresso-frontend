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
    minimumGap: 10
  }
}
