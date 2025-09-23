import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Filter } from '@/models'
import FilterJsonInput from './FilterJsonInput.vue'
import { fn } from 'storybook/test'

// Sample valid filters for stories
const sampleFilters: Filter[] = [
  {
    type: 'daterange',
    q: ['1900-01-01T00:00:00Z TO 1950-12-31T23:59:59Z']
  },
  {
    type: 'newspaper',
    q: ['GDL']
  },
  {
    type: 'string',
    q: 'economy'
  }
]

const meta: Meta<typeof FilterJsonInput> = {
  title: 'Components/Filters/FilterJsonInput',
  component: FilterJsonInput,
  tags: ['autodocs'],
  args: {
    initialValue: '',
    'onUpdate:filters': fn()
  },
  render: args => ({
    components: { FilterJsonInput },
    setup() {
      return { args }
    },
    template: '<FilterJsonInput v-bind="args" />'
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    initialValue: ''
  }
}

export const WithValidJSON: Story = {
  args: {
    initialValue: JSON.stringify(sampleFilters, null, 2)
  }
}

export const WithInvalidJSON: Story = {
  args: {
    initialValue: '{ invalid json }'
  }
}

export const WithInvalidFilter: Story = {
  args: {
    initialValue: JSON.stringify([{ type: 'foo' }])
  }
}
