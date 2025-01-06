import type { Meta, StoryObj } from '@storybook/vue3'
import TermsOfUseModal from '@/components/TermsOfUseModal.vue'
import { ref } from 'vue'

const meta: Meta<typeof TermsOfUseModal> = {
  title: 'Components/TermsOfUseModal',
  component: TermsOfUseModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { TermsOfUseModal },
      template:
        '<div class="bg-dark" style="height: 400px; background:red; width: 100%"><TermsOfUseModal v-bind="args"></TermsOfUseModal></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dialogClass: 'modal-dialog-scrollable modal-lg'
  }
}
