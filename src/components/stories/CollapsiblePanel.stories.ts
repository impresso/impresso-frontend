import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CollapsiblePanel from '@/components/CollapsiblePanel.vue'
import { ref } from 'vue'

const meta: Meta<typeof CollapsiblePanel> = {
  title: 'Components/CollapsiblePanel',
  component: CollapsiblePanel,
  tags: ['autodocs'],
  render: args => {
    return {
      components: { CollapsiblePanel },
      setup() {
        const model = ref(false)
        const updateModel = v => (model.value = v)

        return { args, model, updateModel }
      },
      template:
        '<div style="height: 400px; background:grey; width: 100%; text-align:end"><CollapsiblePanel class="border-bottom" v-bind="args">Cicicio pasticio</CollapsiblePanel></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'FaQ section',
    subtitle: 'This is the content of the collapsible panel'
  }
}
