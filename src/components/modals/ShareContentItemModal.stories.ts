import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ShareContentItemModal from './ShareContentItemModal.vue'
import type { ShareContentItemModalProps } from './ShareContentItemModal.vue'
import { MockContentItem } from '.storybook/mockData/contentItems'

import { useViewsStore } from '@/stores/views'
import { ViewShareContentItem } from '@/constants'

const meta: Meta<typeof ShareContentItemModal> = {
  title: 'modals/ShareContentItemModal',
  component: ShareContentItemModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const viewStore = useViewsStore()
        viewStore.resetView()
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
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: MockContentItem
  } as ShareContentItemModalProps
}
