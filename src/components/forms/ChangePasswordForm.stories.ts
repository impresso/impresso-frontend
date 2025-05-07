import type { Meta, StoryObj } from '@storybook/vue3'
import ChangePaswordForm from './ChangePasswordForm.vue'
import type { ChangePasswordFormProps } from './ChangePasswordForm.vue'

const meta = {
  title: 'forms/ChangePasswordForm',
  component: ChangePaswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form for changing the password of a user.'
      }
    }
  },
  tags: ['autodocs'],
  render: args => ({
    components: { ChangePaswordForm },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 500px; height: 600px;">
        <ChangePaswordForm v-bind="args" />
      </div>
    `
  })
} satisfies Meta<typeof ChangePaswordForm>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    isLoading: false
  } as ChangePasswordFormProps
}
