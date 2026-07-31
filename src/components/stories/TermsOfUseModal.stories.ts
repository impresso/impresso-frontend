import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TermsOfUseModal from '@/components/TermsOfUseModal.vue'
import AcceptTermsOfUse from '@/components/AcceptTermsOfUse.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'

const meta: Meta<typeof TermsOfUseModal> = {
  title: 'Components/TermsOfUseModal',
  component: TermsOfUseModal,
  tags: ['autodocs'],
  /**
   * Mirrors Modals.vue: status alert + AcceptTermsOfUse checkbox live in
   * slots. Checking the box in RequiresAcceptance flips canDismiss so the
   * close controls appear - same as after a real acceptance.
   */
  render: args => ({
    setup() {
      const acceptedAt = ref<string | null>(
        args.acceptTermsDate != null ? String(args.acceptTermsDate) : null
      )
      const onAcceptChange = (event: Event) => {
        const checked = (event.target as HTMLInputElement).checked
        acceptedAt.value = checked ? new Date().toISOString() : null
      }
      return { args, acceptedAt, onAcceptChange }
    },
    components: { TermsOfUseModal, AcceptTermsOfUse, Alert },
    template: `
      <div style="min-height: 100vh">
        <TermsOfUseModal
          v-bind="args"
          :accept-terms-date="acceptedAt"
          :is-visible="true"
        >
          <template #terms-of-use-status>
            <Alert :type="acceptedAt ? 'info' : 'warning'" class="mb-3" style="position: sticky; top: 0">
              <span v-if="acceptedAt">You accepted the Terms of Use.</span>
              <span v-else>Please scroll down and accept the Terms of Use to continue.</span>
            </Alert>
          </template>
          <template #accept-terms-of-use>
            <AcceptTermsOfUse
              :checked="!!acceptedAt"
              :disabled="!!acceptedAt"
              @change="onAcceptChange"
            />
          </template>
        </TermsOfUseModal>
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const RequiresAcceptance: Story = {
  args: {
    dialogClass: 'modal-dialog-scrollable modal-lg',
    isVisible: true,
    acceptTermsDate: null
  }
}

export const AlreadyAccepted: Story = {
  args: {
    dialogClass: 'modal-dialog-scrollable modal-lg',
    isVisible: true,
    acceptTermsDate: new Date().toISOString()
  }
}
