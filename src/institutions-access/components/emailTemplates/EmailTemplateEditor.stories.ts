import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import {
  MockEmailTemplate,
  MockEmailTemplateDisabled
} from '.storybook/mockData/emailTemplates'
import EmailTemplateEditor from './EmailTemplateEditor.vue'
import type { EmailTemplateEditorProps } from './EmailTemplateEditor.vue'

const meta: Meta<typeof EmailTemplateEditor> = {
  title: 'institutions-access/emailTemplates/EmailTemplateEditor',
  component: EmailTemplateEditor,
  tags: ['autodocs'],
  args: {
    onSave: fn()
  },
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        EmailTemplateEditor
      },
      template: `
        <div style="padding: 16px; background: #f5f4f3">
          <EmailTemplateEditor v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    template: MockEmailTemplate
  } as EmailTemplateEditorProps
}

export const EmptyCustomMessage: Story = {
  args: {
    template: { ...MockEmailTemplate, body: '' }
  } as EmailTemplateEditorProps
}

export const Disabled: Story = {
  args: {
    template: MockEmailTemplateDisabled
  } as EmailTemplateEditorProps
}

export const Saving: Story = {
  args: {
    template: MockEmailTemplate,
    isSaving: true
  } as EmailTemplateEditorProps
}

export const WithHtml: Story = {
  args: {
    template: {
      ...MockEmailTemplate,
      body: '<p>Please read our <strong>access conditions</strong> before you continue.</p>'
    }
  } as EmailTemplateEditorProps
}
