import type { Meta, StoryObj } from '@storybook/vue3-vite'
import EmailTemplatePreview from './EmailTemplatePreview.vue'
import type { EmailTemplatePreviewProps } from './EmailTemplatePreview.vue'

const meta: Meta<typeof EmailTemplatePreview> = {
  title: 'institutions-access/emailTemplates/EmailTemplatePreview',
  component: EmailTemplatePreview,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        EmailTemplatePreview
      },
      template: `
        <div style="padding: 16px; max-width: 640px; background: #f5f4f3">
          <EmailTemplatePreview v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const PlainText: Story = {
  args: {
    body: 'If you have questions about this collection, reply to this email.'
  } as EmailTemplatePreviewProps
}

export const BasicHtml: Story = {
  args: {
    body: '<p>Please <a href="https://example.ac.uk/access">read our access conditions</a> before you continue.</p>'
  } as EmailTemplatePreviewProps
}

export const EmptySlot: Story = {
  args: {
    body: ''
  } as EmailTemplatePreviewProps
}

export const Disabled: Story = {
  args: {
    body: 'This text is stored but not inserted.',
    enabled: false
  } as EmailTemplatePreviewProps
}
