import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemViewer from './ContentItemViewer.vue'
import type { ContentItemViewerProps } from './ContentItemViewer.vue'
import { getContentItemHandler, getMediaSourceHandler } from '.storybook/mswHandlers'
import { MockAudioContentItem, MockContentItemPublicDomain } from '.storybook/mockData/contentItems'
import { MockDataProviders } from '.storybook/mockData/dataProviders'

const meta: Meta<typeof ContentItemViewer> = {
  title: 'widget/ContentItemViewer',
  component: ContentItemViewer,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        ;(window as any).impressoDataProviders = MockDataProviders
        return { args }
      },
      components: {
        ContentItemViewer
      },
      template: `
        <div style="height: 500px; width: 100%">
          <ContentItemViewer v-bind="args" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [getContentItemHandler, getMediaSourceHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    contentItemId: MockContentItemPublicDomain.id
  } as ContentItemViewerProps
}

export const HighlightedRegion: Story = {
  args: {
    contentItemId: MockContentItemPublicDomain.id,
    pageId: 'waeschfra-1876-04-08-a-p0004',
    coords: '1462,269,1153,815',
    coordsMargin: '50',
    backgroundColor: '393939',
    overlayBackgroundColor: 'B7F1F855',
    hideCitation: true
  } as ContentItemViewerProps
}

export const NotPublicDomain: Story = {
  args: {
    contentItemId: MockAudioContentItem.id
  } as ContentItemViewerProps
}

export const NotFound: Story = {
  args: {
    contentItemId: 'unknown-1900-01-01-a-i0001'
  } as ContentItemViewerProps
}
