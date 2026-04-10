import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BSearchInputForm from './BSearchInputForm.vue'
import type { BSearchInputFormProps } from './BSearchInputForm.vue'

const meta: Meta<typeof BSearchInputForm> = {
  title: 'legacy/bootstrap/BSearchInputForm',
  component: BSearchInputForm,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input'
    },
    debounce: {
      control: 'number',
      description: 'Debounce delay in milliseconds'
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required'
    },
    minLength: {
      control: 'number',
      description: 'Minimum length of the input'
    },
    maxLength: {
      control: 'number',
      description: 'Maximum length of the input'
    }
  },
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        BSearchInputForm
      },
      template: `
        <div style="padding: 20px; max-width: 400px;">
          <BSearchInputForm
            v-bind="args"
            @submit="args.onSubmit"
          />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    debounce: 500,
    required: true,
    minLength: 0,
    maxLength: 255,
    onSubmit: (value: string) => console.log('Form submitted with:', value)
  } as BSearchInputFormProps & { onSubmit: (value: string) => void }
}

export const WithMinLength: Story = {
  args: {
    placeholder: 'Search (min 3 characters)',
    debounce: 500,
    required: true,
    minLength: 3,
    maxLength: 255,
    onSubmit: (value: string) => console.log('Form submitted with:', value)
  } as BSearchInputFormProps & { onSubmit: (value: string) => void }
}

export const Optional: Story = {
  args: {
    placeholder: 'Search (optional)',
    debounce: 500,
    required: false,
    minLength: 0,
    maxLength: 255,
    onSubmit: (value: string) => console.log('Form submitted with:', value)
  } as BSearchInputFormProps & { onSubmit: (value: string) => void }
}

export const FastDebounce: Story = {
  args: {
    placeholder: 'Search (fast debounce)',
    debounce: 200,
    required: true,
    minLength: 0,
    maxLength: 255,
    onSubmit: (value: string) => console.log('Form submitted with:', value)
  } as BSearchInputFormProps & { onSubmit: (value: string) => void }
}
