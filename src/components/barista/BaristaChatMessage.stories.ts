import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaristaChatMessage from './BaristaChatMessage.vue'
import type { BaristaChatMessageProps } from './BaristaChatMessage.vue'
import {
  MockSystemMessage,
  MockUserMessage,
  MockSystemMessageWithActions,
  MockSystemMessageWithToolCalls,
  MockSystemMessageWithSearchSummary,
  MockSystemMessageWithAdditionalContent,
  MockToolMessage,
  MockComplexSystemMessage
} from '.storybook/mockData/baristaMessages'

const meta: Meta<typeof BaristaChatMessage> = {
  title: 'Barista/BaristaChatMessage',
  component: BaristaChatMessage,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        BaristaChatMessage
      },
      template: `
        <div style="max-width: 600px; padding: 20px;">
          <BaristaChatMessage v-bind="args" />
        </div>
      `
    }
  },
  argTypes: {
    message: {
      control: 'object',
      description: 'A single chat message object to display'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic system message without any additional features
 */
export const SystemMessage: Story = {
  args: {
    message: MockSystemMessage
  } as BaristaChatMessageProps
}

/**
 * Basic user message
 */
export const UserMessage: Story = {
  args: {
    message: MockUserMessage
  } as BaristaChatMessageProps
}

/**
 * System message with action suggestions
 */
export const MessageWithActions: Story = {
  args: {
    message: MockSystemMessageWithActions
  } as BaristaChatMessageProps
}

/**
 * System message showing tool calls and reasoning
 */
export const MessageWithToolCalls: Story = {
  args: {
    message: MockSystemMessageWithToolCalls
  } as BaristaChatMessageProps
}

/**
 * Message with a structured search query summary
 */
export const MessageWithSearchSummary: Story = {
  args: {
    message: MockSystemMessageWithSearchSummary
  } as BaristaChatMessageProps
}

/**
 * Message with additional collapsible content
 */
export const MessageWithAdditionalContent: Story = {
  args: {
    message: MockSystemMessageWithAdditionalContent
  } as BaristaChatMessageProps
}

/**
 * Tool message showing execution
 */
export const ToolMessage: Story = {
  args: {
    message: MockToolMessage
  } as BaristaChatMessageProps
}

/**
 * Complex system message with all features: tool calls, reasoning, actions, search summary, and additional content
 */
export const ComplexMessage: Story = {
  args: {
    message: MockComplexSystemMessage
  } as BaristaChatMessageProps
}

/**
 * Message with long content to show text wrapping
 */
export const LongMessage: Story = {
  args: {
    message: {
      content:
        'This is a very long message that demonstrates how the component handles extensive content. '.repeat(
          10
        ) +
        'The text should wrap properly within the message container and maintain readability even with large amounts of text. The component should handle this gracefully without breaking the layout.',
      timestamp: new Date(),
      type: 'system'
    }
  } as BaristaChatMessageProps
}

/**
 * Empty message to test edge cases
 */
export const EmptyMessage: Story = {
  args: {
    message: {
      content: '',
      timestamp: new Date(),
      type: 'system'
    }
  } as BaristaChatMessageProps
}
