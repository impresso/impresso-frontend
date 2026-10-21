# Migrate topics to the `CachedTopic` contract

Status: draft (2026-10-21).

## Goal

Align the frontend topic model and every UI that reads topic fields with the
backend contract that now ships in `impresso-middle-layer` (branch
`771-integration-of-topic-v3-with-labels`). The backend replaced the old
`label` / `countItems` topic shape with generated, described fields, and added
topic-label v3 metadata plus a new cached/graph type.

Two new reference artifacts exist:

- `src/models/generated/app/cache.d.ts` → `CachedTopic` (new, tracked here).
- `src/models/generated/canonical.d.ts` → public `Topic` / `TopicWord` (already
  used by `ItemLabel.vue` and `ContentItemTopicItem.vue`).

The `CachedTopic` schema is the source of the new field names. The frontend does
not read the Redis cache directly, but the `topics` service now returns the same
label fields and `relatedTopics`/`contentItemsCount` shape, so the UI must follow
the same names. (`topics-graph` still returns its own node shape; see below.)

The hand-written class in `src/models/Topic.ts` still uses the pre-v3 names
(`label`, `countItems`, `relatedTopics: string[]`) and silently drops every new
field in its constructor. As a consequence the affected screens use stale or
`undefined` values today (for example `TopicItem.vue` renders
`item.countItems`, which the API returns as `contentItemsCount`).

Related spec (backend, read-only here): `impresso-middle-layer/docs/specs/upgrade-topics.md`.

## Non-goals

- No backend changes. The middle layer already exposes the new fields.
- No search, filtering or sorting changes on topic labels.
- No visual redesign. Only field names, types and the label/excerpt fallbacks.
- `topics-graph` node shape is documented here but **not** migrated by this spec
  (see "Contract distinctions").

## Source of truth

`CachedTopic` from `src/models/generated/app/cache.d.ts`:

```ts
export interface CachedTopic {
  id: string
  language: string
  model?: string
  words?: TopicWord[]
  topicNumber?: number
  description?: string
  metadata?: string
  category?: string
  shortLabel?: string
  longLabel?: string
  confidence?: 'high' | 'medium' | 'low'
  representativeTerms?: string[]
  generatedBy?: string
  contentItemsCount?: number
  relatedTopics?: { id: string; w: number; avg?: number }[]
  relatedTopicsStats?: {
    MinArticlesIncommon?: number
    MaxRelatedTopicsToKeep?: number
    RelatedThreshold?: number
    Threshold?: number
  }
  degree?: number
  pagerank?: number
  community?: number
  hub?: number
  authority?: number
  x?: number
  y?: number
}

export interface TopicWord {
  w: string
  p: number
  h?: boolean
}
```

Import it with `import type { CachedTopic } from '@/models/generated/app/cache'`.

## Field mapping

### Renames and shape changes

| Old frontend field (`src/models/Topic.ts`) | New field | Notes |
| --- | --- | --- |
| `countItems: number` | `contentItemsCount?: number` | Same meaning, new name. Every `item.countItems` must be renamed. |
| `label: string` | `shortLabel?: string`, `longLabel?: string` | `label` no longer exists. Prefer `shortLabel`, fall back to `longLabel`, then to the words-based excerpt. |
| `relatedTopics: string[]` | `relatedTopics?: { id, w, avg? }[]` | Shape changed from IDs to weighted objects. Also add `relatedTopicsStats?`. |

### Unchanged API fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | required |
| `language` | `string` | required |
| `model` | `string \| undefined` | now optional |
| `words` | `{ w, p, h? }[]` | same shape as before |

### New optional label/graph fields to expose

`topicNumber`, `description`, `metadata`, `category`, `confidence`,
`representativeTerms`, `generatedBy` (topic-labels v3, `undefined` on pre-v3
documents) and `degree`, `pagerank`, `community`, `hub`, `authority`, `x`, `y`
(graph metrics). All are optional; every consumer must handle `undefined`.

### Frontend-only fields to keep

These are derived in the constructor and are **not** part of the API contract:
`excerpt`, `hwp`, `highlighted`, `htmlExcerpt`, plus the UI flag `checked`.
They stay on the `Topic` class.

`matches: string[]` is still returned by `topics.find` when `q` includes a
highlight, so keep it. It is not on `CachedTopic`.

## Contract distinctions (important)

Three different topic shapes reach the UI. Do not conflate them:

1. **`topics` service** (`find` / `get`) → public `Topic` fields
   (`id`, `language`, `contentItemsCount`, `words`, `model`) **plus** the v3
   label fields, `relatedTopics` and `matches` when searching. This is the shape
   the list/detail pages consume.
2. **`topics-graph` service** → a graph node, not a topic:
   `{ id, label, pos: { x, y }, pagerank, community, countItems, degree, language, excerpt, model }`.
   It still uses the **old** `label` and `countItems` names because the middle
   layer has not migrated that service yet (`topics-graph/topics-graph.class.js`
   `toNode()`). `TopicsExplorerPage.vue` reads those names and must **not** be
   renamed as part of this migration.
3. **`ContentItemTopic`** (`src/models/generated/canonical/contentItem.d.ts`) →
   content-item side topics:
   `{ relevance, id, label?, languageCode? }`. This is a separate public schema.
   `Article.ts` maps it into the frontend `Topic`. `ContentItemTopicItem.vue`
   reads `item.label` from this type, which is still valid.

`CachedTopic` is the schema for the middle-layer cache. Use it as the naming
reference and as the type for anything that is genuinely a cached topic; do not
force it onto the `topics-graph` node or `ContentItemTopic`.

## Recommended approach

Keep the `Topic` class (the UI depends on methods like `getHtmlExcerpt()` and on
the derived `excerpt` / `htmlExcerpt`), but:

1. rename the three fields above;
2. extend the constructor to accept and store all new optional fields;
3. type the constructor input as a frontend payload type:
   `type TopicPayload = Partial<CachedTopic> & { matches?: string[] }`;
4. add an `implements Partial<CachedTopic>` (documentation intent) and keep the
   derived members as extra properties;
5. make `getHtmlExcerpt()` prefer `shortLabel`, then `longLabel`.

Alternatives considered: dropping the class for the plain generated types
(rejected for now — it would move label/excerpt logic into every component), and
composing the class from a `CachedTopic` value (deferred; can follow once
callers stop relying on the computed `htmlExcerpt`).

## File inventory

### Model / type layer

- `src/models/Topic.ts` — rename `countItems` → `contentItemsCount`; replace
  `label` with `shortLabel` / `longLabel`; retype `relatedTopics` to the object
  array and add `relatedTopicsStats`; add the v3 and graph fields; update
  `getHtmlExcerpt()` fallback order.
- `src/models/TopicWord.ts` — no field change; optionally
  `implements TopicWord` from `@/models/generated/canonical` (it adds the
  frontend-only `l` quantize level).
- `src/models/Bucket.ts:55` — `new Topic({ ...item, id: value, name: label })`;
  the spread already carries `contentItemsCount` / `shortLabel` once the
  constructor stores them.
- `src/models/Article.ts:148` — maps `ContentItemTopic` into `Topic` with
  `label: topic.label`. Change to `shortLabel: topic.label` (the canonical
  content-item field stays `label`).
- `src/models/ArticleTopic.js`, `src/models/FilterTopic.ts`,
  `src/models/Suggestion.ts`, `src/stores/topics.ts`, `src/stores/monitor.ts` —
  delegate to `new Topic(...)`; no field renames, but they automatically pick up
  the new fields. Optional: type the payloads instead of `any`.
- `src/logic/facets.ts:146` — `LabelExtractors.topic` builds a `Topic` and falls
  back to `item.htmlExcerpt ?? item.label`; change the fallback to
  `item.htmlExcerpt ?? item.shortLabel`.
- `src/models/typeGuards.ts` — `isEntityWithLanguageAndExcerpt` checks
  `language` / `htmlExcerpt`; consider also accepting `shortLabel`.

### Components (topic field reads)

- `src/components/modules/lists/TopicItem.vue` — `item.countItems` →
  `item.contentItemsCount` (label + `$n(...)`); `matches` unchanged.
- `src/components/TopicDetailPage.vue:349` — `this.total = +this.topic.countItems`
  → `this.topic.contentItemsCount`; header uses `getHtmlExcerpt()`.
- `src/components/modules/tooltips/TopicsExplorerTooltip.vue` — `item.countItems`
  → `item.contentItemsCount`; `item.degree` is already the new name.
- `src/components/modules/lists/ItemLabel.vue:9,25` — `item.htmlExcerpt ?? item.label`
  and the detailed `item.label` → `item.htmlExcerpt ?? item.shortLabel` /
  `item.shortLabel`.
- `src/components/modules/lists/FilterLabel.vue:43-44` (topic branch) and its
  local `FilterLabelItem` type → `shortLabel`.
- `src/components/Monitor.vue:183` — `label: this.item.label ?? this.item.id` →
  `shortLabel`.
- `src/components/modules/FilterMonitor.vue:146` — renders `item.htmlExcerpt`
  for topics; no change once the class derives it from `shortLabel`.
- `src/components/modules/collections/recommendations/TopicsRecommendationsPanel.vue:54-57`
  — fabricated items use `htmlExcerpt`; consider `shortLabel` for consistency.
- `src/components/modules/TopicListItem.vue`, `src/components/topics/TopicPreview.vue`,
  `src/components/modules/FilterTopic.vue` (marked deprecated) — use
  `getHtmlExcerpt()` / `words`, no direct rename.

### Graph (do not rename in this change)

- `src/components/TopicsExplorerPage.vue` — reads node `label`, `countItems`,
  `community`, `pagerank`, `degree`. These come from `topics-graph` and keep the
  old names until that service is migrated. Add a `// TODO` and revisit together
  with the backend.

### Fixtures / stories

- `src/components/modules/lists/ArticleItem.stories.ts:76-96` — `new Topic({ id, label })`
  → `shortLabel`.
- `FilterFacet.stories.ts` and `SearchPills.logic.test.ts` use `htmlExcerpt` /
  plain object fixtures, not `Topic`; no change needed.

## Implementation steps

1. **Model.** Update `src/models/Topic.ts`: rename, extend the constructor, add
   the `TopicPayload` type, fix `getHtmlExcerpt()`. Include `contentItemsCount`
   in the derived label pipeline so `TopicItem.vue` works.
2. **Label fallbacks.** Update `getHtmlExcerpt()` and the direct `item.label`
   readers listed above to `shortLabel` (falling back to `longLabel`). Keep the
   words-based excerpt as the last resort so label-less topics still render.
3. **Counts.** Rename every `countItems` read to `contentItemsCount`
   (`TopicItem.vue`, `TopicDetailPage.vue`, `TopicsExplorerTooltip.vue`). Leave
   `TopicsExplorerPage.vue` graph nodes on `countItems` with a TODO.
4. **Mappers.** Fix `Article.ts` (`label` → `shortLabel`) and
   `logic/facets.ts` fallback. Verify `Bucket.ts` spreads the new fields.
5. **Stories.** Update `ArticleItem.stories.ts` fixtures.
6. **Types.** Replace `any[]` in `stores/topics.ts` with `Topic[]` and type
   `stores/monitor.ts` / `Suggestion.ts` payloads if cheap.

Done when: `grep` for `\.countItems` and `\.label` on topic objects resolves to
`contentItemsCount` / `shortLabel` (except the graph nodes and `ContentItemTopic`),
and the type-check reaches zero new errors.

## Verification

- `npm run type-check` — no new errors (the repository should compile against
  `CachedTopic`).
- `npm run lint`.
- Manual: topics list (`/topics`), topic detail, search-results topic facets,
  topic tooltip in the graph, and a content-item page with topics. Confirm:
  - labels show `shortLabel` when present, otherwise the word excerpt;
  - article counts show `contentItemsCount` (not `undefined`);
  - pre-v3 topics (no label fields) still render and do not crash;
  - the topics graph still renders (unchanged `label` / `countItems` node reads).
- Unit: run `npm run test:unit` for touched models/components (add a `Topic`
  constructor test for a v3 payload and a pre-v3 payload if none exists).

## Open questions

- Should `longLabel` be shown anywhere (e.g. topic detail description), or is it
  data-only for now?
- Should the graph migrate to `contentItemsCount` now, in lockstep with the
  backend `topics-graph` change, instead of leaving the TODO?
- Do we want to eventually collapse the `Topic` class into `CachedTopic` plus
  small helpers, or keep the class as the single frontend topic type?

## Out of scope

- Backend `topics-graph` node shape and cache freshness (see the backend spec).
- Search/filter/sort on label fields.
- `ContentItemTopic` (`label` / `languageCode`) and content-item topic bars.
- Any change to how topic-model relations, pagerank, communities or HITS are
  computed.
