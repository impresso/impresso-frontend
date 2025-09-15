import type { Meta, StoryObj } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import BaristaModal from './BaristaModal.vue'

const meta: Meta<typeof BaristaModal> = {
  title: 'Barista/BaristaModal',
  component: BaristaModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const handleSubmit = action('submit')
        return { args, handleSubmit }
      },
      components: { BaristaModal },
      template: `
      <div style="height: 600px; width: 100%">
        <BaristaModal v-bind="args" @submit="handleSubmit"></BaristaModal>
        
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
    title: 'Ask Barista'
  }
}
