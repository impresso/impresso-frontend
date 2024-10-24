import type { Meta, StoryObj } from '@storybook/vue3'
import ComposeSearchQuery from '../ComposeSearchQuery.vue'
import type { Props } from '../ComposeSearchQuery.vue'

const meta: Meta<typeof ComposeSearchQuery> = {
  title: 'Components/ComposeSearchQuery',
  component: ComposeSearchQuery,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => {
    return {
      components: { ComposeSearchQuery },
      setup() {
        return { args }
      },
      template:
        '<div style="height: 400px; width: 100%; text-align:end"><ComposeSearchQuery v-bind="args"/></div>'
    }
  },
  decorators: []
} satisfies Meta<typeof ComposeSearchQuery>

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
        type: 'isFront'
      }
    ]
  } as Props
}
