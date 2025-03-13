import type { Meta, StoryObj } from '@storybook/vue3'
import FiltersRenderPanel from './FiltersRenderPanel.vue'
import { protobuf } from 'impresso-jscommons'

// Generate a sample valid filters base64 string for the stories
const sampleFilters = {
  filters: [
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
}

const validFiltersBase64 = protobuf.searchQuery.serialize(sampleFilters)
const invalidFiltersBase64 = 'invalid_base64_string'

const meta = {
  title: 'Components/Filters/FiltersRenderPanel',
  component: FiltersRenderPanel,
  tags: ['autodocs'],
  args: {
    modelValue: validFiltersBase64
  },
  render: args => ({
    components: { FiltersRenderPanel },
    setup() {
      return { args }
    },
    template: '<FiltersRenderPanel v-bind="args" />'
  })
} satisfies Meta<typeof FiltersRenderPanel>

export default meta
type Story = StoryObj<typeof meta>

export const ValidFilters: Story = {
  args: {
    modelValue: validFiltersBase64
  }
}

export const InvalidFilters: Story = {
  args: {
    modelValue: invalidFiltersBase64
  }
}

export const EmptyFilters: Story = {
  args: {
    modelValue: ''
  }
}
