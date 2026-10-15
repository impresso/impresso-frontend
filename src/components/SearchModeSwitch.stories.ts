import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import SearchModeSwitch from './SearchModeSwitch.vue'
import type { SearchModeSwitchProps } from './SearchModeSwitch.vue'

const meta: Meta<typeof SearchModeSwitch> = {
  title: 'Components/SearchModeSwitch',
  component: SearchModeSwitch,
  tags: ['autodocs'],
  render: args => ({
    components: { SearchModeSwitch },
    setup() {
      const mode = ref(args.modelValue)
      return { args, mode }
    },
    template: `
      <SearchModeSwitch
        v-bind="args"
        v-model="mode"
      />
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs: SearchModeSwitchProps = {
  modelValue: 'keyword'
}

export const Default: Story = {
  args: defaultArgs
}

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    disabled: true
  }
}
