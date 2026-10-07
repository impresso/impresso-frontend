import type { EmailTemplate } from '@/institutions-access/services/emailTemplates'

export const MockEmailTemplate: EmailTemplate = {
  body: 'If you have questions about this collection, reply to this email and we will pass them on to the reviewer.',
  enabled: true
}

export const MockEmailTemplateDisabled: EmailTemplate = {
  ...MockEmailTemplate,
  enabled: false
}
