import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SpecialMembershipModal from './SpecialMembershipModal.vue'
import type { SpecialMembershipModalProps } from './SpecialMembershipModal.vue'
import { ref, watch } from 'vue'
import {
  findEmpty,
  findSpecialMembershipAccessHandler,
  findUserSpecialMembershipRequestsHandler
} from '.storybook/mswHandlers'

const meta: Meta<typeof SpecialMembershipModal> = {
  title: 'specialMembership/SpecialMembershipModal',
  component: SpecialMembershipModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const isVisible = ref(false)
        watch(
          () => args.isVisible,
          newVal => {
            // debounce change to local state
            setTimeout(() => {
              isVisible.value = newVal
            }, 300)
          },
          { immediate: true }
        )
        return { args, isVisible }
      },
      components: { SpecialMembershipModal },
      template:
        '<div style="height: 500px; width: 100%"><SpecialMembershipModal :isVisible="isVisible" :params="args.params"></SpecialMembershipModal></div>'
    }
  },
  parameters: {
    msw: {
      handlers: [findUserSpecialMembershipRequestsHandler, findSpecialMembershipAccessHandler]
    }
  }
}

export default meta // ← ADD THIS LINE

type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    isVisible: true
  } as SpecialMembershipModalProps
}

export const empty: Story = {
  args: {
    isVisible: true
  } as SpecialMembershipModalProps,
  parameters: {
    msw: {
      handlers: [
        findEmpty(findUserSpecialMembershipRequestsHandler),
        findEmpty(findSpecialMembershipAccessHandler)
      ]
    }
  }
}
