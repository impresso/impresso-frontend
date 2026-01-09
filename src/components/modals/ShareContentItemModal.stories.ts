import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ShareContentItemModal from './ShareContentItemModal.vue'
import type { ShareContentItemModalProps } from './ShareContentItemModal.vue'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'

import { useViewsStore } from '@/stores/views'
import { ViewShareContentItem } from '@/constants'
import { getMediaSourceHandler } from '.storybook/mswHandlers'
import { MockDataProviders } from '.storybook/mockData/dataProviders'

const meta: Meta<typeof ShareContentItemModal> = {
  title: 'modals/ShareContentItemModal',
  component: ShareContentItemModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const viewStore = useViewsStore()
        viewStore.resetView()

        // Inject the mock data into the global window object
        ;(window as any).impressoDataProviders = MockDataProviders
        return { args, viewStore, ViewShareContentItem }
      },
      components: {
        ShareContentItemModal
      },
      template: `
        <div style="height: 500px; width: 100%">
          <Teleport to="body">
            <ShareContentItemModal
              isVisible
              @dismiss="viewStore.resetView"
              v-bind="args"
            />
          </Teleport>
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
  } as ShareContentItemModalProps
}
