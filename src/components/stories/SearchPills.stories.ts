import type { Meta, StoryObj } from '@storybook/vue3'
import SearchPills from '../SearchPills.vue'
import { Filter } from '@/models'

interface Props {
  filters?: Filter[]
}

const meta: Meta<typeof SearchPills> = {
  title: 'Components/SearchPills',
  component: SearchPills,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => {
    ;(window as any).impressoDocumentsYearSpan = { firstYear: 1738, lastYear: 2018 }
    return {
      components: { SearchPills },
      setup() {
        return { args }
      },
      template:
        '<div style="height: 400px; width: 100%; text-align:end"><SearchPills v-bind="args"/></div>'
    }
  },
  decorators: []
} satisfies Meta<typeof SearchPills>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    filters: [
      {
        type: 'string',
        q: ['lune', 'soleil']
      },
      {
        type: 'language',
        q: ['fr', 'it', 'en', 'fi']
      }
    ]
  } as Props
}
