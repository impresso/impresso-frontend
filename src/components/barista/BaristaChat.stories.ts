import type { Meta, StoryObj } from '@storybook/vue3'
import BaristaChat from './BaristaChat.vue'
import { fn } from '@storybook/test'

const meta = {
  title: 'Barista/BaristaChat',
  component: BaristaChat,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A chat interface for interacting with the Barista AI assistant.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    onSearch: fn()
  },
  render: args => ({
    components: { BaristaChat },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 500px; height: 600px;">
        <BaristaChat v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof BaristaChat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}

export const WithCustomResponse: Story = {
  args: {}
  // decorators: [
  //   () => {
  //     return {}
  //   }
  // ]
}

export const WithError: Story = {
  args: {},
  decorators: [
    () => {
      // TODO: mock it in a better way
      /*
      // Override the mock implementation to simulate an error
      const mockCreate = fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 800))
        throw new Error('Service unavailable')
      })

      // Replace the mock implementation
      barista.create = mockCreate
      */

      return {}
    }
  ]
}
