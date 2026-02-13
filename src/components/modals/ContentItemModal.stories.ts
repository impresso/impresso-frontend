import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContentItemModal from './ContentItemModal.vue'
import type { ContentItemModalProps } from './ContentItemModal.vue'
import { MockContentItemPublicDomain } from '.storybook/mockData/contentItems'
import { getMediaSourceHandler } from '.storybook/mswHandlers'
import { MockDataProviders } from '.storybook/mockData/dataProviders'

const meta: Meta<typeof ContentItemModal> = {
  title: 'modals/ContentItemModal',
  component: ContentItemModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        // Inject the mock data into the global window object
        ;(window as any).impressoDataProviders = MockDataProviders

        return { args }
      },
      components: {
        ContentItemModal
      },
      template: `
        <div style="height: 600px; width: 100%">
          <Teleport to="body">
            <ContentItemModal
              isVisible
              @dismiss="args.onDismiss"
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
    item: MockContentItemPublicDomain,
    onDismiss: () => console.log('Modal dismissed')
  } as ContentItemModalProps & { onDismiss: () => void }
}
