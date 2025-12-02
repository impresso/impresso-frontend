import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Modals from '@/components/Modals.vue'
import LinkToModal from '@/components/LinkToModal.vue'
import {
  ViewChangePasswordSuccess,
  ViewCreateSpecialMembershipRequestSuccess,
  Views
} from '@/constants'

const meta: Meta<typeof Modals> = {
  title: 'Components/Modals',
  component: Modals,
  tags: ['!autodocs'],
  render: args => {
    return {
      setup() {
        const availableViews = [
          ViewChangePasswordSuccess,
          ViewCreateSpecialMembershipRequestSuccess
        ]
        return { args, availableViews: availableViews }
      },
      components: { Modals, LinkToModal },
      template: `<div style="height: 400px; width: 100%">
      <ul>
        <li v-for="view in availableViews" :key="view">
          <LinkToModal :view="view" >
            Open {{ view }} Modal
          </LinkToModal>
        </li>
      </ul>
      <Modals v-bind="args" />
      </div>`
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}
