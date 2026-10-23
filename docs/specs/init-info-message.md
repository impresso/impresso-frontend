# Startup announcement modal

When configured, startup loads a public project-wiki page and displays an active message once in a
modal. Updating the wiki changes the message without rebuilding or redeploying the application.

## Source

Configure the raw Markdown source through `VITE_ANNOUNCEMENT_MD_URL`:

```text
VITE_ANNOUNCEMENT_MD_URL=https://raw.githubusercontent.com/wiki/impresso/impresso.github.io/Maintenance.md
```

When the variable is unset or empty, the app does not make an announcement request or display an
announcement. The `Maintenance.md` filename is case-sensitive. The wiki must remain public and
restricted to collaborator editing because its Markdown is rendered inside the application.

## Wiki page format

An optional front-matter block must start on the first line and is followed by the Markdown body:

```markdown
---
id: 2026-10-22-php-security-advisory
severity: error
title: 'Impresso currently not available'
dismissible: false
---

Impresso is currently not available as a precaution. **No user action is required.**
```

| Field | Default | Description |
| --- | --- | --- |
| `id` | Hash of the body | Message identity. Change it to display a message again. |
| `title` | None | Title displayed in the alert within the modal. |
| `severity` | `info` | One of `info`, `warning`, or `error`. |
| `active` | `true` | Set to `false` to unpublish the message. |
| `dismissible` | `true` | Set to `false` to remove the close controls. |

No message is shown for inactive, empty, malformed, or unavailable pages. Unterminated front
matter is malformed.

## Runtime behavior

- Startup triggers the fetch without awaiting it, with a four-second timeout.
- A `?t=<minutes since epoch>` cache buster is appended. Do not add request headers, which would
  cause an unsupported GitHub CORS preflight.
- Once available, the announcement opens only after the initialization sequence completes and when
  no other modal is active. It takes precedence over automatic Terms of Use and plan-change
  dialogs.
- The title is the only content shown inside the severity alert. The Markdown body is rendered by
  the existing `MarkdownContent` component below it.
- Dismissing a message stores its ID in `localStorage` under `announcement-dismissed`.
- Non-dismissible announcements do not expose a close button, footer action, or Escape-key close.
  Unpublish these messages by setting `active: false` when the incident ends.

The parser supports CRLF line endings and uses only the first colon in each front-matter field as
the separator. The body renderer receives the same cache-busted URL as the parser request, so the
browser can serve the second request from its HTTP cache.

## Publishing

To publish, edit the wiki page with a new `id`, severity, title, and Markdown body. To correct a
typo without resurfacing the modal, keep the existing ID. To show it again, change the ID. To
unpublish it, set `active: false`.
