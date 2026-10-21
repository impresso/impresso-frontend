import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import EmailVerificationForm from './EmailVerificationForm.vue'
import type {
  EmailVerificationFormPayload,
  EmailVerificationFormProps
} from './EmailVerificationForm.vue'

type StoryArgs = EmailVerificationFormProps & {
  onSubmit: (payload: EmailVerificationFormPayload) => void
  onSendEmailVerificationRequest: (email: string) => void
}

const meta: Meta<typeof EmailVerificationForm> = {
  title: 'Components/EmailVerificationForm',
  component: EmailVerificationForm,
  tags: ['autodocs'],
  render: args => ({
    components: { EmailVerificationForm },
    setup() {
      return { args }
    },
    template: `
      <div style="max-width: 480px; padding: 1.5rem;">
        <EmailVerificationForm v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs: StoryArgs = {
  token: 'verification-token-example',
  onSubmit: fn(),
  onSendEmailVerificationRequest: fn()
}

export const Default: Story = {
  args: defaultArgs
}

export const MissingToken: Story = {
  args: {
    ...defaultArgs,
    token: ''
  }
}

export const Loading: Story = {
  args: {
    ...defaultArgs,
    isLoading: true
  }
}
