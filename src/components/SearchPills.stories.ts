import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { FilterWithItems } from '@/models'
import SearchPills from './SearchPills.vue'
import type { PillItem, SearchPillsProps } from './SearchPills.vue'

interface StoryProps extends SearchPillsProps {
  filters?: FilterWithItems<PillItem>[]
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
  } as StoryProps
}

export const PageFilter: Story = {
  args: {
    filters: [
      {
        context: 'include',
        op: 'OR',
        type: 'page',
        q: ['1', '3']
      }
    ]
  } as StoryProps
}

export const ManyPagesFilter: Story = {
  args: {
    filters: [
      {
        context: 'include',
        op: 'OR',
        type: 'page',
        q: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        items: [
          { id: '1', label: '1', name: '1' },
          { id: '2', label: '2', name: '2' },
          { id: '3', label: '3', name: '3' },
          { id: '4', label: '4', name: '4' },
          { id: '5', label: '5', name: '5' },
          { id: '6', label: '6', name: '6' },
          { id: '7', label: '7', name: '7' },
          { id: '8', label: '8', name: '8' },
          { id: '9', label: '9', name: '9' },
          { id: '10', label: '10', name: '10' },
          { id: '11', label: '11', name: '11' },
          { id: '12', label: '12', name: '12' }
        ]
      }
    ]
  } as StoryProps
}
