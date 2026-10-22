import axios from 'axios'
import { ref } from 'vue'

const BASE_URL =
  'https://raw.githubusercontent.com/wiki/impresso/impresso.github.io/Maintenance.md'
const KEY = 'announcement-dismissed'
const SEVERITIES = ['info', 'warning', 'error'] as const

export interface Announcement {
  id: string
  title?: string
  severity: (typeof SEVERITIES)[number]
  dismissible: boolean
  url: string
}

export interface ParsedFrontMatter {
  meta: Record<string, string | boolean>
  body: string
  valid: boolean
}

export const announcement = ref<Announcement | null>(null)

const hash = (value: string) =>
  String([...value].reduce((result, character) => (result * 31 + character.charCodeAt(0)) | 0, 0))

export function parseFrontMatter(text: string): ParsedFrontMatter {
  const source = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trimStart()
  const meta: Record<string, string | boolean> = {}

  if (!source.startsWith('---\n')) {
    return { meta, body: source.trim(), valid: true }
  }

  const end = source.indexOf('\n---', 3)
  if (end === -1) {
    return { meta, body: source, valid: false }
  }

  for (const line of source.slice(4, end).split('\n')) {
    const separator = line.indexOf(':')
    if (separator < 1 || line.trim().startsWith('#')) {
      continue
    }

    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2')
    meta[line.slice(0, separator).trim()] =
      value === 'true' ? true : value === 'false' ? false : value
  }

  return { meta, body: source.slice(end + 4).trim(), valid: true }
}

export async function loadAnnouncement() {
  try {
    const url = `${BASE_URL}?t=${Math.floor(Date.now() / 60000)}`
    const { data } = await axios.get<string>(url, { responseType: 'text', timeout: 4000 })
    const { meta, body, valid } = parseFrontMatter(data)

    if (!valid || !body || meta.active === false) {
      return
    }

    const id = String(meta.id ?? hash(body))
    if (localStorage.getItem(KEY) === id) {
      return
    }

    announcement.value = {
      id,
      title: meta.title ? String(meta.title) : undefined,
      severity: SEVERITIES.includes(meta.severity as Announcement['severity'])
        ? (meta.severity as Announcement['severity'])
        : 'info',
      dismissible: meta.dismissible !== false,
      url
    }
  } catch (error) {
    console.debug('[announcement] none', error)
  }
}

export function dismissAnnouncement() {
  if (!announcement.value) {
    return
  }

  try {
    localStorage.setItem(KEY, announcement.value.id)
  } catch (error) {
    console.debug('[announcement] could not store dismissal', error)
  }

  announcement.value = null
}
