import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SourcesOverviewModal from './SourcesOverviewModal.vue'
import type { SourcesOverviewModalProps } from './SourcesOverviewModal.vue'
import type { DataReleaseExtended } from '@/services/types'
import { http, HttpResponse } from 'msw'

const meta = {
  title: 'SourceOverview/SourcesOverviewModal',
  component: SourcesOverviewModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A base modal component that can be used to create various types of modals.'
      }
    }
  },
  tags: ['autodocs'],
  render: args => ({
    components: { SourcesOverviewModal },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 900px; height: 600px; padding: 10px; background-color: #f0f0f0;">
        <SourcesOverviewModal v-bind="args">
        [Content goes here]
        </SourcesOverviewModal>
      </div>
    `
  })
} satisfies Meta<typeof SourcesOverviewModal>
export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    isVisible: true,
    modalTitle: 'Sources Overview'
  } as SourcesOverviewModalProps
}
