import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SearchComposer from '../SearchComposer.vue'

const meta: Meta<typeof SearchComposer> = {
  title: 'Pages/SearchComposer',
  component: SearchComposer,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: args => {
    return {
      components: { SearchComposer },
      setup() {
        return { args }
      },
      template: '<div style="height:500px"><SearchComposer v-bind="args"/></div>'
    }
  },
  decorators: []
} satisfies Meta<typeof SearchComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}
