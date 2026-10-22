import { describe, expect, it } from 'vitest'
import { parseFrontMatter } from './useAnnouncement'

describe('parseFrontMatter', () => {
  it('returns the full message when it has no front matter', () => {
    expect(parseFrontMatter('  A **maintenance** message  ')).toEqual({
      meta: {},
      body: 'A **maintenance** message',
      valid: true
    })
  })

  it('handles CRLF line endings and colons in values', () => {
    expect(
      parseFrontMatter(
        "---\r\nid: maintenance\r\ntitle: 'Scheduled maintenance: 12:00 UTC'\r\n---\r\n\r\nMessage"
      )
    ).toEqual({
      meta: {
        id: 'maintenance',
        title: 'Scheduled maintenance: 12:00 UTC'
      },
      body: 'Message',
      valid: true
    })
  })

  it('parses inactive messages', () => {
    expect(parseFrontMatter('---\nactive: false\n---\nMessage')).toEqual({
      meta: { active: false },
      body: 'Message',
      valid: true
    })
  })

  it('returns an empty body for a front-matter-only page', () => {
    expect(parseFrontMatter('---\nid: maintenance\n---\n')).toEqual({
      meta: { id: 'maintenance' },
      body: '',
      valid: true
    })
  })

  it('rejects unterminated front matter', () => {
    expect(parseFrontMatter('---\nid: maintenance\nMessage')).toEqual({
      meta: {},
      body: '---\nid: maintenance\nMessage',
      valid: false
    })
  })
})
