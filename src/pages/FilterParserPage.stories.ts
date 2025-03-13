import type { Meta, StoryObj } from '@storybook/vue3'
import FilterParserPage from './FilterParserPage.vue'
import { Filter } from 'impresso-jscommons'
import { toSerializedFilters } from '@/logic/filters'
import { userEvent, within } from '@storybook/test'

// Generate sample valid filters for the stories
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
  title: 'Pages/FilterParserPage',
  component: FilterParserPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A page that combines FilterTextInput and FiltersRenderPanel to parse and render filter strings. It accepts base64 encoded filter strings or URLs containing filter strings in query parameters.'
      }
    }
  }
} satisfies Meta<typeof FilterParserPage>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: 'Empty State'
}

export const WithBase64Input: Story = {
  name: 'With Base64 Input',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.paste(validFiltersBase64)
  }
}

export const WithUrlInput: Story = {
  name: 'With URL Input',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.paste(sampleUrl)
  }
}
