import type { Meta, StoryObj } from '@storybook/vue3'
import FeedbackModal from '@/components/FeedbackModal.vue'

const meta: Meta<typeof FeedbackModal> = {
  title: 'Components/FeedbackModal',
  component: FeedbackModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { FeedbackModal },
      template: `
      <div style="height: 400px; width: 100%">
        <FeedbackModal v-bind="args"></FeedbackModal>
      </div>
      `
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isVisible: true,
    isLoading: true,
    title: 'Help us improve Impresso'
  }
}
