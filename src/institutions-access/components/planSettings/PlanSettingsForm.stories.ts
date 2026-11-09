import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import PlanSettingsForm from './PlanSettingsForm.vue'
import type { PlanSettingsFormProps } from './PlanSettingsForm.vue'

const meta: Meta<typeof PlanSettingsForm> = {
  title: 'institutions-access/planSettings/PlanSettingsForm',
  component: PlanSettingsForm,
  tags: ['autodocs'],
  args: {
    'onUpdate:modelValue': fn()
  },
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        PlanSettingsForm
      },
      template: `
        <div style="padding: 16px; max-width: 52rem; background: var(--impresso-color-paper)">
          <PlanSettingsForm v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    modelValue: {
      modality: 'cc_reviewer',
      enableTemporaryAutomaticApproval: false,
      revokeAfterDays: null,
      revokeTemporaryAutomaticApprovalAfterDays: null
    }
  } as PlanSettingsFormProps
}

export const TemporaryApproval: Story = {
  args: {
    modelValue: {
      modality: 'notify_reviewer',
      enableTemporaryAutomaticApproval: true,
      revokeAfterDays: 365,
      revokeTemporaryAutomaticApprovalAfterDays: 14
    }
  } as PlanSettingsFormProps
}
