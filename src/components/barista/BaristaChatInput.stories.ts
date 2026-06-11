import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaristaChatInput from './BaristaChatInput.vue'

const meta: Meta<typeof BaristaChatInput> = {
  title: 'Barista/ChatInput',
  component: BaristaChatInput,
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Disables the input and shows "Sending…" on the button'
    },
    onSubmit: { action: 'submit' }
  },
  parameters: {
    layout: 'centered'
  }
}

export default meta
type Story = StoryObj<typeof BaristaChatInput>

const wrap = (inner: string) =>
  `<div style="width: 420px;">${inner}</div>`

export const Default: Story = {
  render: args => ({
    components: { BaristaChatInput },
    setup() {
      return { args }
    },
    template: wrap('<BaristaChatInput v-bind="args" @submit="args.onSubmit" />')
  }),
  args: {
    isLoading: false
  }
}

export const Loading: Story = {
  render: args => ({
    components: { BaristaChatInput },
    setup() {
      return { args }
    },
    template: wrap('<BaristaChatInput v-bind="args" @submit="args.onSubmit" />')
  }),
  args: {
    isLoading: true
  }
}

export const WithFilters: Story = {
  render: args => ({
    components: { BaristaChatInput },
    setup() {
      return { args }
    },
    template: wrap('<BaristaChatInput v-bind="args" @submit="args.onSubmit" />')
  }),
  args: {
    isLoading: false,
    filters: [
      { type: 'daterange', q: ['1900', '1950'] },
      { type: 'newspaper', q: ['GDL'] }
    ] as any
  }
}
