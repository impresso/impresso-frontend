import type { Meta, StoryObj } from '@storybook/vue3-vite'
import InfoButton from './InfoButton.vue'
import type { InfoButtonProps } from './InfoButton.vue'

const meta: Meta<typeof InfoButton> = {
  title: 'Base/InfoButton',
  component: InfoButton,
  tags: ['autodocs'],
  render: args => ({
    setup() {
      return { args }
    },
    components: {
      InfoButton
    },
    template: `
      <div style="padding: 3rem; min-height: 14rem; display: flex; align-items: flex-start; gap: 0.75rem; background: white;">
        <span>Click the icon to open the popover</span>
        <InfoButton v-bind="args" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'About this feature',
    defaultContent: 'This popover provides short contextual help without leaving the current page.',
    triggerClass: 'ms-1'
  } as InfoButtonProps
}

export const WithSlot: Story = {
  render: args => ({
    setup() {
      return { args }
    },
    components: {
      InfoButton
    },
    template: `
      <div style="padding: 3rem; min-height: 14rem; display: flex; align-items: flex-start; gap: 0.75rem; background: white;">
        <span>Click the icon to open the popover</span>
        <InfoButton v-bind="args">
          <div class="mt-2 small text-left">Custom slot content rendered inside the popover.</div>
        </InfoButton>
      </div>
    `
  }),
  args: {
    name: 'About this feature',
    defaultContent:
      'This story shows the component with additional content injected through the default slot.',
    triggerClass: 'ms-1'
  } as InfoButtonProps
}
