import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import MediaTypeSwitch, { type MediaType } from './MediaTypeSwitch.vue'

const meta: Meta<typeof MediaTypeSwitch> = {
  title: 'Components/MediaTypeSwitch',
  component: MediaTypeSwitch,
  tags: ['autodocs'],
  render: args => ({
    setup() {
      const modelValue = ref<MediaType>(args.modelValue)
      return { args, modelValue }
    },
    components: { MediaTypeSwitch },
    template: `
      <div class="p-4">
        <MediaTypeSwitch v-bind="args" v-model="modelValue" />
      </div>
    `
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const Radio: Story = {
  args: {
    modelValue: 'radio_broadcast'
  }
}

export const Newspaper: Story = {
  args: {
    modelValue: 'newspaper'
  }
}

export const Both: Story = {
  args: {
    modelValue: 'both'
  }
}

export const Disabled: Story = {
  args: {
    modelValue: 'both',
    disabled: true
  }
}

export const CustomColors: Story = {
  args: {
    modelValue: 'radio_broadcast',
    colors: {
      radio_broadcast: '#dc3545',
      newspaper: '#0d6efd',
      both: '#198754'
    }
  }
}

export const InNavbarNav: Story = {
  args: {
    modelValue: 'both'
  },
  render: args => ({
    setup() {
      const modelValue = ref<MediaType>(args.modelValue)
      return { args, modelValue }
    },
    components: { MediaTypeSwitch },
    template: `
      <ul class="navbar-nav border-start border-left px-3 py-2 align-items-end gap-2">
        <li>
          <MediaTypeSwitch v-bind="args" v-model="modelValue" />
        </li>
      </ul>
    `
  })
}
