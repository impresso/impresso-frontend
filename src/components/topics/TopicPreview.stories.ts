import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TopicPreview from './TopicPreview.vue'
import type { TopicPreviewProps } from './TopicPreview.vue'
import { getTopicHandler } from '.storybook/mswHandlers'
import { MockTopic } from '.storybook/mockData/topics'

const meta: Meta<typeof TopicPreview> = {
  title: 'components/TopicPreview',
  component: TopicPreview,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        TopicPreview
      },
      template: `
        <div style="padding: 1rem;">
          <TopicPreview
            v-bind="args"
            @more="handleMore"
          />
        </div>
      `,
      methods: {
        handleMore() {
          console.log('More clicked')
        }
      }
    }
  },

  parameters: {
    msw: {
      handlers: [getTopicHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: {
      id: MockTopic.id
    }
  } as TopicPreviewProps
}
