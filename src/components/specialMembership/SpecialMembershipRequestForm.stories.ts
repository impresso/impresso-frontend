import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SpecialMembershipRequestForm from './SpecialMembershipRequestForm.vue'
import type { SpecialMembershipRequestFormProps } from './SpecialMembershipRequestForm.vue'
import { fn } from 'storybook/test'

const meta: Meta<typeof SpecialMembershipRequestForm> = {
  title: 'specialMembership/SpecialMembershipRequestForm',
  component: SpecialMembershipRequestForm,
  tags: ['autodocs'],
  render: args => ({
    components: { SpecialMembershipRequestForm },
    setup() {
      return { args }
    },
    template: '<SpecialMembershipRequestForm v-bind="args" />'
  })
}

export default meta
type Story = StoryObj<typeof SpecialMembershipRequestForm>

export const Default: Story = {
  args: {
    onSubmit: fn(),
    specialMembershipAccess: {
      id: 1,
      title: 'Data Domain Access Example',
      bitmapPosition: 1
    },
    notesMinLength: 20,
    notesMaxLength: 500
  } as SpecialMembershipRequestFormProps
}
