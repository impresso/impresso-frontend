import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse } from 'msw'
import BaristaConversations from './BaristaConversations.vue'
import { findBaristaConversationsHandler } from '.storybook/mswHandlers'
import { MockBaristaConversations } from '.storybook/mockData/baristaConversations'

const getBaristaConversationHandler = http.get(
  '/api/barista-conversations/:id',
  async ({ params }) => {
    const { id } = params
    await new Promise(resolve => setTimeout(resolve, 250))

    const conversation = MockBaristaConversations.find(item => item.baristaSessionId === id)
    if (!conversation) {
      return HttpResponse.json({ message: 'Conversation not found' }, { status: 404 })
    }

    return HttpResponse.json({
      ...conversation,
      messages: []
    })
  }
)

const meta: Meta<typeof BaristaConversations> = {
  title: 'Barista/BaristaConversations',
  component: BaristaConversations,
  tags: ['autodocs'],
  render: args => ({
    components: { BaristaConversations },
    setup() {
      return { args }
    },
    template: `
      <div style="height: 420px; width: 360px; padding: 16px; background: #f8f9fa">
        <BaristaConversations v-bind="args" />
      </div>
    `
  }),
  parameters: {
    msw: {
      handlers: [findBaristaConversationsHandler, getBaristaConversationHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
