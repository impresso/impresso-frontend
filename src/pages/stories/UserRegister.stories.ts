import type { Meta, StoryObj } from '@storybook/vue3'
import UserRegister from '../UserRegister.vue'

const meta: Meta<typeof UserRegister> = {
  title: 'Pages/UserRegister',
  component: UserRegister,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: (args) => {
    return {
      components: { UserRegister },
      setup() {
        return { args }
      },
      template: '<UserRegister />'
    }
  },
  decorators: [],
} satisfies Meta<typeof UserRegister>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
