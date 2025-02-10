import type { Meta, StoryObj } from '@storybook/vue3'
import UserArea from '@/components/UserArea.vue'
import type { UserAreaProps } from '@/components/UserArea.vue'

const meta: Meta<typeof UserArea> = {
  title: 'Components/UserArea',
  component: UserArea,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { UserArea },
      template:
        '<div class="bg-dark" style="height: 400px; background:grey; width: 100%; text-align:end"><UserArea v-bind="args"></UserArea></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    userPlanLabel: 'Impresso User',
    user: {
      uid: '1',
      username: 'johndoe',
      isActive: true,
      isStaff: false,
      // name: 'John Doe',
      email: '',
      firstname: 'John',
      lastname: 'Doe',

      pattern: ['#664562', '#FF3212', '#123456']
    }
  } as UserAreaProps
}
