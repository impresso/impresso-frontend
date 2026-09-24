import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MediaSourceModal from './MediaSourceModal.vue'
import type { MediaSourceModalProps } from './MediaSourceModal.vue'
import { GDL } from '.storybook/mockData/mediaSources'

const meta: Meta<typeof MediaSourceModal> = {
  title: 'modals/MediaSourceModal',
  component: MediaSourceModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        MediaSourceModal
      },
      template: `
        <div style="height: 600px; width: 100%">
          <MediaSourceModal
            v-bind="args"
            @close="() => {}"
          />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: GDL
  } as MediaSourceModalProps
}
