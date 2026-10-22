# Spec: Startup announcement modal

Status: Proposed
Owner: frontend

## 1. What it does

At startup, the app fetches one markdown page from the project wiki and, if it contains an
active message, shows it once in a modal. Editing the wiki page changes the message:
**no rebuild, no redeploy, no env variable.** The change to the existing codebase is
kept to a minimum (see section 5).

## 2. Message source

Wiki page: https://github.com/impresso/impresso.github.io/wiki/Maintenance

Raw URL (hardcoded in the code):

```
https://raw.githubusercontent.com/wiki/impresso/impresso.github.io/Maintenance.md
```

The file name is case-sensitive (`Maintenance.md`). The repo must stay public, and in the
repo settings **Restrict editing to collaborators only** must be ticked, because the
content is displayed inside the app.

## 3. File format

Optional front matter on the **first line** of the page, then the markdown message.

```markdown
---
id: 2026-10-22-php-security-advisory
severity: error
title: '⚠️ Impresso currently not available ⚠️'
dismissible: false
---

Impresso is currently not available as a precaution. **No user action is required.**
```

| Field         | Default          | Meaning                                                                            |
| ------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `id`          | hash of the body | Identity of the message. A new `id` shows it again to everyone. **Always set it.** |
| `title`       | none             | Modal title.                                                                       |
| `severity`    | `info`           | `info`, `warning` or `error`.                                                      |
| `active`      | `true`           | `false` hides the message (use it to unpublish).                                   |
| `dismissible` | `true`           | `false` removes the close buttons.                                                 |

Nothing is shown if `active: false`, the body is empty, the file can't be fetched, or the
front matter has no closing `---`.

## 4. Behaviour

1. Init requests the raw URL with a 4 s timeout. The request is **not awaited**, so a
   slow GitHub never delays startup. Any error means "no message".
2. A cache-buster `?t=<minutes since epoch>` is added because GitHub caches raw files for
   about 5 minutes. Do not add custom request headers (they trigger a CORS preflight that
   GitHub does not answer).
3. When a message is available, the app is initialized (`initSequenceDone`), and no other
   modal is open, the announcement modal opens. It goes **before** Terms of Use and
   Change Plan, which open after it is closed.
4. The message body is rendered by the existing `MarkdownContent` component.
5. Closing it stores the `id` in `localStorage`. The same `id` is not shown again.
   With `dismissible: false` it cannot be closed, so unpublish it once the issue is over.

## 5. Implementation

**Principle: keep changes to the existing codebase to a minimum.** One new file, one line
in `init.ts`, and a small addition to `Modals.vue`. `MarkdownContent.vue` is **not
modified**: it already fetches the URL, strips the front matter and renders the markdown.

| File                                 | Change                                                                                                                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/composables/useAnnouncement.ts` | **New** (the only new file). Fetches the wiki file, reads the front matter, decides whether to show it, remembers the dismissal. No Pinia store.                                                                            |
| `src/init.ts`                        | Call `loadAnnouncement()` (not awaited). One line.                                                                                                                                                                          |
| `src/components/Modals.vue`          | Open the announcement in the existing `InfoModal` when `announcement` is set, `view === null` and `notificationsStore.initSequenceDone`. Add `!announcement` to the conditions that auto-open Terms of Use and Change Plan. |
| `src/components/InfoModal.vue`       | Only if needed: allow hiding the header close button when `dismissible` is `false`. Skip it if the modal can be made non-closable another way.                                                                              |

### 5.1 `src/composables/useAnnouncement.ts`

```ts
import axios from 'axios'
import { ref } from 'vue'

const BASE_URL = 'https://raw.githubusercontent.com/wiki/impresso/impresso.github.io/Maintenance.md'
const KEY = 'announcement-dismissed'
const SEVERITIES = ['info', 'warning', 'error']

export interface Announcement {
  id: string
  title?: string
  severity: 'info' | 'warning' | 'error'
  dismissible: boolean
  url: string // passed to <MarkdownContent :url="...">
}

export const announcement = ref<Announcement | null>(null)

const hash = (s: string) => String([...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0))

export function parseFrontMatter(text: string) {
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trimStart()
  const meta: Record<string, string | boolean> = {}
  if (!src.startsWith('---\n')) return { meta, body: src.trim(), valid: true }
  const end = src.indexOf('\n---', 3)
  if (end === -1) return { meta, body: src, valid: false } // unterminated: show nothing
  for (const line of src.slice(4, end).split('\n')) {
    const i = line.indexOf(':') // first colon only (titles, ISO dates)
    if (i < 1 || line.trim().startsWith('#')) continue
    const v = line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    meta[line.slice(0, i).trim()] = v === 'true' ? true : v === 'false' ? false : v
  }
  return { meta, body: src.slice(end + 4).trim(), valid: true }
}

export async function loadAnnouncement() {
  try {
    // cache-buster: GitHub caches raw files for about 5 minutes
    const url = `${BASE_URL}?t=${Math.floor(Date.now() / 60000)}`
    const { data } = await axios.get<string>(url, { responseType: 'text', timeout: 4000 })
    const { meta, body, valid } = parseFrontMatter(data)
    if (!valid || !body || meta.active === false) return
    const id = String(meta.id ?? hash(body))
    if (localStorage.getItem(KEY) === id) return
    announcement.value = {
      id,
      title: meta.title ? String(meta.title) : undefined,
      severity: SEVERITIES.includes(String(meta.severity)) ? (meta.severity as Announcement['severity']) : 'info',
      dismissible: meta.dismissible !== false,
      url,
    }
  } catch (e) {
    console.debug('[announcement] none', e) // any failure = no announcement
  }
}

export function dismissAnnouncement() {
  if (!announcement.value) return
  try { localStorage.setItem(KEY, announcement.value.id) } catch { /* ignore */ }
  announcement.value = null
}
```

The modal renders the body with the existing `MarkdownContent` using the **same URL**
(including the `?t=` value), so the browser serves it from its HTTP cache and the file is
effectively fetched once.

### 5.2 `Modals.vue` (sketch)

Adapt to the real `InfoModal` and `Alert` props:

```vue
<InfoModal
  v-if="showAnnouncement"
  :title="announcement.title"
  :hide-header-close="!announcement.dismissible"
  @close="announcement.dismissible && dismissAnnouncement()"
>
  <Alert :type="announcement.severity">
    <MarkdownContent :url="announcement.url" />
  </Alert>
</InfoModal>
```

with `showAnnouncement = !!announcement.value && view.value === null && notificationsStore.initSequenceDone`.

### 5.3 Security: no sanitizer added

`MarkdownContent` renders with `v-html` and no sanitizer, exactly as it already does for
the Terms of Use fetched from GitHub. The announcement keeps the same trust model: **only
repo collaborators can edit the wiki** (setting _Restrict editing to collaborators only_,
see section 2). With that setting, the people who can inject content into the modal are
the people who can already push code to the project. DOMPurify can be added later in
`MarkdownContent` (one line) if the wiki is ever opened to more editors.

### 5.4 Known limitation

`MarkdownContent` strips front matter with `/^---[\s\S]*?---\n/`, which does not match
CRLF line endings. The announcement parser above handles CRLF, but the modal body would
then show the raw front matter. If this ever happens (check the live page after the first
publish), replace the regex in `MarkdownContent` with one that accepts `\r?\n`.

## 6. Publishing (ops)

| Goal       | Action                                                            |
| ---------- | ----------------------------------------------------------------- |
| Publish    | Edit the wiki page: new `id`, `severity`, `title`, message. Save. |
| Fix a typo | Edit the text, keep the `id`.                                     |
| Show again | Change the `id`.                                                  |
| Unpublish  | Set `active: false`.                                              |

Live for new visitors within about 5 minutes. Check the raw URL in a browser to see
exactly what the app will receive.

## 7. Not included (on purpose)

Multiple sources and priorities, start/end dates, audience targeting, translations,
backend-provided notices, and the "mount the app even if init fails" change in `main.ts`.
Each can be added later if needed.

## 8. Testing

- Unit test `parse`: no front matter, CRLF, colon in a value, `active: false`, empty
  body, unterminated front matter.
- Manual, from a clean browser profile: the message appears once, stays closed after
  reload, reappears after an `id` change, and disappears with `active: false`.
