import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaristaChatPanel from './BaristaChatPanel.vue'
import { ref } from 'vue'

const meta: Meta<typeof BaristaChatPanel> = {
  title: 'Barista/ChatPanel',
  component: BaristaChatPanel,
  tags: ['autodocs'],
  argTypes: {
    messages: {
      control: 'object',
      description: 'Array of chat messages'
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the chat is in loading state'
    },
    onSubmit: { action: 'submit' }
  },
  parameters: {
    layout: 'centered'
  }
}

export default meta
type Story = StoryObj<typeof BaristaChatPanel>

// Helper function to create timestamps with different times
const createTimestamp = (minutesAgo: number) => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutesAgo)
  return date
}

// Base story with minimal setup
export const Default: Story = {
  render: args => ({
    components: { BaristaChatPanel },
    setup() {
      return { args }
    },
    template:
      '<div style="height: 600px; width: 400px;"><BaristaChatPanel v-bind="args" @submit="args.onSubmit" /></div>'
  }),
  args: {
    messages: [
      {
        content: 'Hello! How can I help you today?',
        timestamp: createTimestamp(10),
        type: 'system'
      },
      {
        content: "I'm looking for information about coffee production.",
        timestamp: createTimestamp(8),
        type: 'user'
      },
      {
        content:
          'Coffee production is the industrial process of converting coffee beans to various coffee products. Major steps include harvesting, processing, drying, roasting, grinding, and packaging.',
        timestamp: createTimestamp(7),
        type: 'system'
      }
    ],
    isLoading: false
  }
}

// Story showing messages with actions
export const WithActions: Story = {
  render: args => ({
    components: { BaristaChatPanel },
    setup() {
      return { args }
    },
    template:
      '<div style="height: 600px; width: 400px;"><BaristaChatPanel v-bind="args" @submit="args.onSubmit" /></div>'
  }),
  args: {
    messages: [
      {
        content: 'Hello! How can I help you today?',
        timestamp: createTimestamp(10),
        type: 'system'
      },
      {
        content: "I'm interested in learning about coffee beans from Ethiopia.",
        timestamp: createTimestamp(8),
        type: 'user'
      },
      {
        content:
          'Ethiopian coffee beans are known for their distinctive fruity and wine-like flavor profile. They often exhibit notes of blueberry, strawberry, and other berries, with a bright acidity and medium body.',
        timestamp: createTimestamp(7),
        type: 'system',
        actions: [
          {
            type: 'search',
            context: 'Ethiopian coffee production statistics'
          },
          {
            type: 'search',
            context: 'Ethiopian coffee varieties'
          }
        ]
      },
      {
        content: 'Do you have more information about Ethiopian Yirgacheffe?',
        timestamp: createTimestamp(5),
        type: 'user'
      },
      {
        content:
          'Yirgacheffe is a coffee region in Ethiopia known for producing some of the most distinct and sought-after coffees in the world. These beans typically feature floral and citrus notes with a clean, bright acidity and light to medium body.',
        timestamp: createTimestamp(4),
        type: 'system',
        actions: [
          {
            type: 'search',
            context: 'Yirgacheffe coffee brewing methods'
          }
        ]
      }
    ],
    isLoading: false
  }
}

// Story showing loading state
export const Loading: Story = {
  render: args => ({
    components: { BaristaChatPanel },
    setup() {
      return { args }
    },
    template:
      '<div style="height: 600px; width: 400px;"><BaristaChatPanel v-bind="args" @submit="args.onSubmit" /></div>'
  }),
  args: {
    messages: [
      {
        content: 'Hello! How can I help you today?',
        timestamp: createTimestamp(10),
        type: 'system'
      },
      {
        content: 'Can you tell me about coffee roasting techniques?',
        timestamp: createTimestamp(1),
        type: 'user'
      }
    ],
    isLoading: true
  }
}

// Story showing interactive state
export const Interactive: Story = {
  render: args => ({
    components: { BaristaChatPanel },
    setup() {
      const messages = ref([...args.messages])
      const isLoading = ref(false)

      const handleSubmit = (message: string) => {
        // Add user message
        messages.value.push({
          content: message,
          timestamp: new Date(),
          type: 'user'
        })

        // Simulate loading
        isLoading.value = true

        // Simulate response after delay
        setTimeout(() => {
          messages.value.push({
            content: `You asked about: "${message}". This is a simulated response in the story.`,
            timestamp: new Date(),
            type: 'system',
            actions:
              message.length > 10
                ? [
                    {
                      type: 'search',
                      context: `More information about ${message.substring(0, 20)}...`
                    }
                  ]
                : undefined
          })
          isLoading.value = false
        }, 1500)
      }

      return { messages, isLoading, handleSubmit }
    },
    template: `
      <div style="height: 600px; width: 400px;">
        <BaristaChatPanel
          :messages="messages"
          :isLoading="isLoading"
          @submit="handleSubmit"
        />
      </div>
    `
  }),
  args: {
    messages: [
      {
        content: 'Hello! This is an interactive demo. Type a message below to see a response.',
        timestamp: new Date(),
        type: 'system'
      }
    ]
  }
}
