import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChangePasswordModal from '@/components/modals/ChangePasswordModal.vue'
import type { ChangePasswordModalProps } from '@/components/modals/ChangePasswordModal.vue'

const meta: Meta<typeof ChangePasswordModal> = {
  title: 'modals/ChangePasswordModal',
  component: ChangePasswordModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ChangePasswordModal },
      template:
        '<div style="height: 500px; width: 100%"><ChangePasswordModal v-bind="args"></ChangePasswordModal></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    modalTitle: 'Change your password',
    isVisible: true
  } as ChangePasswordModalProps
}
