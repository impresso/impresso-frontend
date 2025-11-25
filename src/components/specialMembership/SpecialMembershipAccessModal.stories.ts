import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SpecialMembershipAccessModal from './SpecialMembershipAccessModal.vue'
import type { SpecialMembershipAccessModalProps } from './SpecialMembershipAccessModal.vue'
import { ref, watch } from 'vue'
import { findEmpty, findSpecialMembershipAccessHandler } from '.storybook/mswHandlers'

const meta: Meta<typeof SpecialMembershipAccessModal> = {
  title: 'specialMembership/SpecialMembershipAccessModal',
  component: SpecialMembershipAccessModal,
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
      components: { SpecialMembershipAccessModal },
      template:
        '<div style="height: 500px; width: 100%"><SpecialMembershipAccessModal :isVisible="isVisible"></SpecialMembershipAccessModal></div>'
    }
  },
  parameters: {
    msw: {
      handlers: [findSpecialMembershipAccessHandler]
    }
  }
}

export default meta // ← ADD THIS LINE

type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    isVisible: true
  } as SpecialMembershipAccessModalProps
}

export const empty: Story = {
  args: {
    isVisible: true
  } as SpecialMembershipAccessModalProps,
  parameters: {
    msw: {
      handlers: [findEmpty(findSpecialMembershipAccessHandler)]
    }
  }
}
