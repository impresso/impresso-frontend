import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterTextInput from './FilterTextInput.vue'
import { Filter } from 'impresso-jscommons'
import { fn } from 'storybook/test'
import { toSerializedFilters } from '@/logic/filters'

// Generate a sample valid filters base64 string for the stories
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

const validFiltersBase64 = toSerializedFilters(sampleFilters)
const sampleUrl = `https://impresso-project.ch/search?f=${validFiltersBase64}`

const meta = {
  title: 'Components/Filters/FilterTextInput',
  component: FilterTextInput,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    'onUpdate:filterString': fn(),
    'onUpdate:modelValue': fn()
  },
  render: args => ({
    components: { FilterTextInput },
    setup() {
      return {
        args
      }
    },
    template: '<FilterTextInput v-bind="args" />'
  })
} satisfies Meta<typeof FilterTextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    modelValue: ''
  }
}

export const WithBase64: Story = {
  args: {
    modelValue: validFiltersBase64
  }
}

export const WithUrl: Story = {
  args: {
    modelValue: sampleUrl
  }
}
