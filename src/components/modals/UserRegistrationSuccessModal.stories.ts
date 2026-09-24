import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UserRegistrationSuccessModal from '@/components/modals/UserRegistrationSuccessModal.vue'
import type { UserRegistrationSuccessModalProps } from '@/components/modals/UserRegistrationSuccessModal.vue'

const meta: Meta<typeof UserRegistrationSuccessModal> = {
  title: 'modals/UserRegistrationSuccessModal',
  component: UserRegistrationSuccessModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { UserRegistrationSuccessModal },
      template:
        '<div style="height: 500px; width: 100%"><UserRegistrationSuccessModal v-bind="args" /></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isVisible: true
  } as UserRegistrationSuccessModalProps
}
