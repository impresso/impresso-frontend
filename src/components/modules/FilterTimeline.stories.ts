import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterTimeline from './FilterTimeline.vue'
import FilterDaterange from '@/models/FilterDaterange'
import Daterange from '@/models/Daterange'

// Define the component metadata
const meta: Meta<typeof FilterTimeline> = {
  title: 'Components/Modules/FilterTimeline',
  component: FilterTimeline,
  tags: ['autodocs'],
  argTypes: {
    infoButtonId: {
      control: 'text',
      description: 'ID of the info button to display'
    },
    startYear: {
      control: 'number',
      description: 'Start year for the timeline'
    },
    endYear: {
      control: 'number',
      description: 'End year for the timeline'
    },
    minDate: {
      control: 'date',
      description: 'Minimum date for the timeline'
    },
    maxDate: {
      control: 'date',
      description: 'Maximum date for the timeline'
    },
    groupBy: {
      control: 'select',
      options: ['articles', 'passages', 'images'],
      description: 'What to group the timeline by'
    },
    filters: {
      control: 'object',
      description: 'Array of date range filters'
    },
    values: {
      control: 'object',
      description: 'Timeline values array'
    },
    disableRelativeDisplayStyle: {
      control: 'boolean',
      description: 'Whether to disable the relative display style option'
    }
  },
  parameters: {
    docs: {
      description: {
        component:
          'A timeline component that allows users to filter content by date range. Supports both absolute and relative display modes and can handle multiple date filters.'
      }
    }
  }
}

export default meta

type Story = StoryObj<typeof FilterTimeline>

// Generate sample timeline values
const generateTimelineValues = (startYear: number, endYear: number) => {
  const values = []
  for (let year = startYear; year <= endYear; year++) {
    values.push({
      t: new Date(year, 0, 1),
      w: Math.floor(Math.random() * 100) + 20, // count value
      p: Math.floor(Math.random() * 10) // percentage value
    })
  }
  return values
}

// Sample date range filter
const createDaterangeFilter = (start: Date, end: Date) => {
  const daterange = new Daterange({ start, end })
  return new FilterDaterange({
    type: 'daterange',
    q: [daterange.getValue()]
  })
}

// Basic story with default values
export const Default: Story = {
  args: {
    startYear: 1900,
    endYear: 1950,
    minDate: new Date(1900, 0, 1),
    maxDate: new Date(1950, 11, 31),
    groupBy: 'articles',
    filters: [],
    values: generateTimelineValues(1900, 1950),
    disableRelativeDisplayStyle: false
  }
}

// Story with a date filter applied
export const WithDateFilter: Story = {
  args: {
    ...Default.args,
    filters: [createDaterangeFilter(new Date(1920, 0, 1), new Date(1930, 11, 31))]
  }
}

// Story with multiple date filters
export const WithMultipleDateFilters: Story = {
  args: {
    ...Default.args,
    filters: [
      createDaterangeFilter(new Date(1920, 0, 1), new Date(1930, 11, 31)),
      createDaterangeFilter(new Date(1940, 0, 1), new Date(1945, 11, 31))
    ]
  }
}

// Story showing passage grouping
export const PassagesTimeline: Story = {
  args: {
    ...Default.args,
    groupBy: 'passages'
  }
}

// Story with relative display style disabled
export const DisabledRelativeDisplayStyle: Story = {
  args: {
    ...Default.args,
    disableRelativeDisplayStyle: true
  }
}

// Story with images grouping
export const ImagesTimeline: Story = {
  args: {
    ...Default.args,
    groupBy: 'images'
  }
}
