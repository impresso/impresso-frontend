import {
  getDefaultEmailTemplate,
  getDefaultEmailTemplates,
  type EmailTemplate
} from '@/institutions-access/services/emailTemplates'

export const MockEmailTemplates: EmailTemplate[] = getDefaultEmailTemplates().map(template => ({
  ...template,
  dateLastModified: '2026-02-14T10:30:00.000Z'
}))

export const MockEmailTemplate = {
  ...getDefaultEmailTemplate(),
  dateLastModified: '2026-02-14T10:30:00.000Z'
}

export const MockEmailTemplateDisabled: EmailTemplate = {
  ...MockEmailTemplate,
  enabled: false
}
