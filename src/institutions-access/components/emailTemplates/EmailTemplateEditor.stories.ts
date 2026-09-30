import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { MockEmailTemplate, MockEmailTemplateDisabled } from '.storybook/mockData/emailTemplates'
import EmailTemplateEditor from './EmailTemplateEditor.vue'
import type { EmailTemplateEditorProps } from './EmailTemplateEditor.vue'

const meta: Meta<typeof EmailTemplateEditor> = {
  title: 'institutions-access/emailTemplates/EmailTemplateEditor',
  component: EmailTemplateEditor,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        const draft = ref(args.modelValue)
        return { args, draft }
      },
      components: {
        EmailTemplateEditor
      },
      template: `
        <div style="padding: 16px; background: #f5f4f3">
          <EmailTemplateEditor v-bind="args" v-model="draft" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    modelValue: MockEmailTemplate
  } as EmailTemplateEditorProps
}

export const EmptyCustomMessage: Story = {
  args: {
    modelValue: { ...MockEmailTemplate, body: '' }
  } as EmailTemplateEditorProps
}

export const Disabled: Story = {
  args: {
    modelValue: MockEmailTemplateDisabled
  } as EmailTemplateEditorProps
}

export const Saving: Story = {
  args: {
    modelValue: MockEmailTemplate,
    disabled: true
  } as EmailTemplateEditorProps
}

export const WithHtml: Story = {
  args: {
    modelValue: {
      ...MockEmailTemplate,
      body: '<p>Please read our <strong>access conditions</strong> before you continue.</p>'
    }
  } as EmailTemplateEditorProps
}
