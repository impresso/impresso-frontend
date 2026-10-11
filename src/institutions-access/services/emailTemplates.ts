/**
 * Institution reviewers do not edit the Impresso auto-reply. That email lives in
 * `impresso-user-admin` as
 * `user_special_membership_request_created_to_user` and already has a greeting,
 * request details and a signature. The customisable slot is stored on the
 * special-membership plan as `metadata.emailExtraMessageHtml` / `Text`.
 *
 * There is one auto-reply: it is sent when a requester submits a request.
 */

export interface EmailTemplate {
  /**
   * Institution-authored fragment inserted as
   * `emailExtraMessageHtml` / `emailExtraMessageText`. Plain text or basic HTML.
   * Empty means the slot is omitted.
   */
  body: string
  /** When false the fragment is stored as null and not inserted into the email. */
  enabled: boolean
}

/** Longest custom message the editor accepts, in characters. */
export const EmailBodyMaxLength = 5000

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

export const getDefaultEmailTemplate = (): EmailTemplate => ({
  body: '',
  enabled: false
})
