import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterUrlPanel from './FilterUrlPanel.vue'
import type { Filter } from '@/models'

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

const meta = {
  title: 'Components/Filters/FilterUrlPanel',
  component: FilterUrlPanel,
  tags: ['autodocs'],
  args: {
    filters: sampleFilters
  },
  parameters: {
    docs: {
      description: {
        component:
          'A component that displays URLs with base64-encoded filters for different environments.'
      }
    }
  }
} satisfies Meta<typeof FilterUrlPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    filters: sampleFilters
  }
}

export const Empty: Story = {
  args: {
    filters: []
  }
}

export const ComplexFilters: Story = {
  args: {
    filters: [
      ...sampleFilters,
      {
        type: 'location',
        q: ['Geneva', 'Lausanne'],
        op: 'OR'
      },
      {
        type: 'language',
        q: ['fr']
      }
    ]
  }
}
