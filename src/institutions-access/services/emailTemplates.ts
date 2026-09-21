/**
 * Institution reviewers do not edit the Impresso auto-reply. That email lives in
 * `impresso-user-admin` as
 * `user_special_membership_request_created_to_user` and already has a greeting,
 * request details and a signature. The only customisable slot is
 * `special_membership_custom_template_txt` / `_html`.
 *
 * There is one auto-reply: it is sent when a requester submits a request.
 *
 * The backend does not expose an `email-templates` service yet, so the app runs
 * against {@link createLocalEmailTemplatesClient}.
 */

/** The only auto-reply institutions can customise. */
export const AutoReplyTemplateId = 'request-received' as const

export type EmailTemplateId = typeof AutoReplyTemplateId

export interface EmailTemplate {
  id: EmailTemplateId
  /**
   * Institution-authored fragment inserted as
   * `special_membership_custom_template_txt` / `_html`. Plain text or basic HTML.
   * Empty means the slot is omitted.
   */
  body: string
  /** When false the fragment is stored but not inserted into the email. */
  enabled: boolean
  dateLastModified: string
}

export interface EmailTemplatesFindResponse {
  data: EmailTemplate[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export interface EmailTemplatesClient {
  find(): Promise<EmailTemplatesFindResponse>
  get(id: string): Promise<EmailTemplate>
  patch(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate>
}

export interface EmailEnvelope {
  /** Read-only copy that appears above the custom slot. */
  before: string
  /** Read-only copy that appears below the custom slot, including the signature. */
  after: string
}

/**
 * Sample values already filled in, matching
 * `user_special_membership_request_created_to_user.txt`. Institution users
 * never see or insert `{{ variables }}`.
 */
export const AutoReplyEnvelope: EmailEnvelope = {
  before: [
    'Dear Ada,',
    '',
    'Thank you for requesting special membership access on Impresso.',
    '',
    'Here are the details of the access you requested, for your reference:',
    '',
    'Membership Option: Domain of CNA archive',
    'Request Date: Monday, 08.12.2025, 11:52 UTC',
    'Current Status: Pending',
    'Notes: No notes provided.'
  ].join('\n'),
  after: [
    'We aim to complete the review as quickly as possible and will notify you as soon as a decision has been made. Please check your inbox regularly, as the reviewer may reach out to you via email (e.g., to send a contract for signature).',
    '',
    'We appreciate your patience!',
    '',
    'Best regards,',
    'The Impresso Team'
  ].join('\n')
}

const DefaultTemplate: EmailTemplate = {
  id: AutoReplyTemplateId,
  body: 'If you have questions about this collection, reply to this email and we will pass them on to the reviewer.',
  enabled: true,
  dateLastModified: '2026-01-01T00:00:00.000Z'
}

export const getDefaultEmailTemplate = (): EmailTemplate => ({ ...DefaultTemplate })

export const getDefaultEmailTemplates = (): EmailTemplate[] => [getDefaultEmailTemplate()]

const StorageKey = 'impresso.institutionsAccess.emailTemplates.v3'

export const createLocalEmailTemplatesClient = (
  { delay = 250 }: { delay?: number } = {}
): EmailTemplatesClient => {
  const wait = () => new Promise(resolve => setTimeout(resolve, delay))

  const read = (): EmailTemplate => {
    try {
      const stored = window.localStorage.getItem(StorageKey)
      if (!stored) return getDefaultEmailTemplate()
      const parsed = JSON.parse(stored) as EmailTemplate
      return { ...getDefaultEmailTemplate(), ...parsed, id: AutoReplyTemplateId }
    } catch (error) {
      console.warn('[emailTemplates] Could not read stored template, using default.', error)
      return getDefaultEmailTemplate()
    }
  }

  const write = (template: EmailTemplate) => {
    try {
      window.localStorage.setItem(StorageKey, JSON.stringify(template))
    } catch (error) {
      console.warn('[emailTemplates] Could not persist template.', error)
    }
  }

  return {
    async find() {
      await wait()
      const template = read()
      return { data: [template], pagination: { total: 1, limit: 1, offset: 0 } }
    },
    async get(id) {
      await wait()
      if (id !== AutoReplyTemplateId) throw new Error(`Unknown email template: ${id}`)
      return read()
    },
    async patch(id, data) {
      await wait()
      if (id !== AutoReplyTemplateId) throw new Error(`Unknown email template: ${id}`)
      const updated: EmailTemplate = {
        ...read(),
        ...data,
        id: AutoReplyTemplateId,
        dateLastModified: new Date().toISOString()
      }
      write(updated)
      return updated
    }
  }
}

export const createHttpEmailTemplatesClient = (
  basePath = '/api/email-templates'
): EmailTemplatesClient => {
  const request = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
    })
    if (!response.ok) {
      throw new Error(`Request to ${url} failed with status ${response.status}`)
    }
    return response.json()
  }

  return {
    find: () => request(basePath),
    get: id => request(`${basePath}/${id}`),
    patch: (id, data) =>
      request(`${basePath}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }
}

export const emailTemplatesClient: EmailTemplatesClient = createLocalEmailTemplatesClient()
