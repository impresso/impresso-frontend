import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FeedbackModal from '@/components/FeedbackModal.vue'
import { vueRouter } from 'storybook-vue3-router'
import { ref } from 'vue'
import { action } from 'storybook/actions'

const meta: Meta<typeof FeedbackModal> = {
  title: 'Components/FeedbackModal',
  component: FeedbackModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const handleSubmit = action('submit')
        return { args, handleSubmit }
      },
      components: { FeedbackModal },
      template: `
      <div style="height: 600px; width: 100%">
        <FeedbackModal v-bind="args" @submit="handleSubmit"></FeedbackModal>
        
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
    isLoading: false,
    title: 'Help us improve Impresso'
  }
}
Default.decorators = [
  /* this is the basic setup with no params passed to the decorator */
  vueRouter()
]

export const WithErrors: Story = {
  args: {
    isVisible: true,
    title: 'Help us improve Impresso',
    errorMessages: [
      {
        id: '019029302019201',
        message: 'Something went wrong',
        code: 400,
        name: 'BadRequest',
        route: ['feedback.create']
      }
    ]
  }
}

WithErrors.decorators = [
  /* this is the basic setup with no params passed to the decorator */
  vueRouter()
]
