import type { Meta, StoryObj } from '@storybook/vue3'
import Toast from './Toast.vue'

const meta: Meta<typeof Toast> = {
  title: 'Base/Toast',
  component: Toast,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    notification: { id: '', type: 'info', title: 'Info', message: 'This is an info toast' }
  }
}

export const Success: Story = {
  args: {
    notification: { id: '', type: 'success', title: 'Success', message: 'This is a success toast' }
  }
}
export const WithoutTitle: Story = {
  args: {
    notification: {
      id: '',
      type: 'info',
      title: '',
      message: 'This is an info toast without a title'
    }
  }
}
export const WithoutCloseButton: Story = {
  args: {
    notification: {
      id: '',
      type: 'info',
      title: '',
      message: 'This is an info toast without a title'
    },
    showCloseButton: false
  }
}
