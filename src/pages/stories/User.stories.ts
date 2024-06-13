import { vueRouter } from 'storybook-vue3-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import User from '../User.vue'

const meta: Meta<typeof User> = {
  title: 'Pages/User',
  component: User,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: (args) => {
    return {
      components: { User },
      setup() {
        return { args }
      },
      template: '<User />'
    }
  },
  decorators: [vueRouter([{
    name: "entity",
    path: "/nothing",
    redirect: "/nothing"
  }])],
} satisfies Meta<typeof User>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
