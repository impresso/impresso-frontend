import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SpecialMembershipButton from './SpecialMembershipButton.vue'
import type { SpecialMembershipButtonProps } from './SpecialMembershipButton.vue'
import SpecialMembershipRequestModal from './SpecialMembershipRequestModal.vue'
import SpecialMembershipModal from './SpecialMembershipModal.vue'
import { MockUserSpecialMembershipRequests } from '.storybook/mockData/specialMembership'
import {
  createUserSpecialMembershipRequestHandler,
  findSpecialMembershipAccessHandler,
  findUserSpecialMembershipRequestsHandler
} from '.storybook/mswHandlers'
import { useViewsStore } from '@/stores/views'
import { ViewCreateSpecialMembershipRequest, ViewSpecialMembership } from '@/constants'

const meta: Meta<typeof SpecialMembershipButton> = {
  title: 'specialMembership/SpecialMembershipButton',
  component: SpecialMembershipButton,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const viewStore = useViewsStore()
        viewStore.resetView()
        return { args, viewStore, ViewCreateSpecialMembershipRequest, ViewSpecialMembership }
      },
      components: {
        SpecialMembershipButton,
        SpecialMembershipRequestModal,
        SpecialMembershipModal
      },
      template: `
        <div style="height: 500px; width: 100%">
          <SpecialMembershipButton v-bind="args" />
          
          <!-- Modals (same as in your layout) -->
          <Teleport to="body">
            <SpecialMembershipRequestModal
              :isVisible="viewStore.view === ViewCreateSpecialMembershipRequest"
              :item="viewStore.specialMembershipAccessItem"
              @dismiss="viewStore.resetView"
            />
            
            <SpecialMembershipModal
              :isVisible="viewStore.view === ViewSpecialMembership"
              @dismiss="viewStore.resetView"
            />
          </Teleport>
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [
        findUserSpecialMembershipRequestsHandler,
        findSpecialMembershipAccessHandler,
        createUserSpecialMembershipRequestHandler
      ]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    item: MockUserSpecialMembershipRequests[1].specialMembershipAccess
  } as SpecialMembershipButtonProps
}

export const withoutItem: Story = {
  args: {} as SpecialMembershipButtonProps
}
