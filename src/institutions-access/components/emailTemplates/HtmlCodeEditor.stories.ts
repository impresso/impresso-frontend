import type { Meta, StoryObj } from '@storybook/vue3-vite'
import HtmlCodeEditor from './HtmlCodeEditor.vue'

const meta: Meta<typeof HtmlCodeEditor> = {
  title: 'institutions-access/emailTemplates/HtmlCodeEditor',
  component: HtmlCodeEditor,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        HtmlCodeEditor
      },
      template: `
        <div style="padding: 16px; max-width: 640px; background: #f5f4f3">
          <HtmlCodeEditor v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const PlainText: Story = {
  args: {
    modelValue: 'If you have questions, reply to this email.'
  }
}

export const BasicHtml: Story = {
  args: {
    modelValue: '<p>Please <a href="https://example.ac.uk">read our conditions</a>.</p>'
  }
}

export const Disabled: Story = {
  args: {
    modelValue: '<p>Read-only message</p>',
    disabled: true
  }
}
