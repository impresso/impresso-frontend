import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemCard from './ContentItemCard.vue'
import type { ContentItemCardProps } from './ContentItemCard.vue'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'
import { getMediaSourceHandler } from '.storybook/mswHandlers'

const meta: Meta<typeof ContentItemCard> = {
  title: 'contentItem/ContentItemCard',
  component: ContentItemCard,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        ContentItemCard
      },
      template: `
        <div class="p-4">
          <ContentItemCard v-bind="args" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [getMediaSourceHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: MockContentItemPublicDomain
  } as ContentItemCardProps
}

export const showingMetadata: Story = {
  args: {
    item: MockContentItemPublicDomain,
    showMetadata: true
  } as ContentItemCardProps
}
