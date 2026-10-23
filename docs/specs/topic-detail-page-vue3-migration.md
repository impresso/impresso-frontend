# Topic detail page: Vue 3 migration

## Scope

Migrate only `src/components/TopicDetailPage.vue` to
`src/pages/TopicDetailPage.vue`, following
`.github/agents/create-a-page.agent.md`. Use `src/pages/ViewImage.vue` as the
reference for typed route state, focused watchers, reusable item presentation,
and layout headers.

- Keep `/topics/:topic_id`, route name `topic`, and `requiresAuth: false`.
- In `src/router/index.ts`, lazy-load the new page for the existing detail child
  and remove its obsolete eager import. Reuse `Routes.topic` where appropriate;
  retain the child path `:topic_id` under `/topics`.
- Do not migrate `TopicsPage`, `TopicsExplorerPage`, their sidebar, or the graph.
  Do not add nested routes, modal views, or backend changes.
- This is separate from the broader
  [CachedTopic contract migration](migrate-topics-to-cached-topic.md); reuse the
  current model rather than repeating that migration.

## Page structure and conventions

- Use `<script setup lang="ts">`, Composition API, typed props, and `@/` imports.
- Keep a single `<i-layout-section main>`: `TopicsPage` already owns the layout
  and sidebar. Do not copy the additional sidebar from `ViewImage.vue`.
- Preserve the back link, overview/articles tabs, filter/search actions, ordering,
  word list, yearly timeline, facet panels, and related content items.
- Replace `b-container` / `b-row` / `b-col` with Bootstrap grid classes.
- Use `$t()` in templates, English-only local `<i18n lang="json">`, and no
  `useI18n()`. Translate the currently hard-coded overview headings/descriptions.
- Import `LoadingBlock`; use loading refs with `try` / `finally`, visible errors,
  and empty states. Disable topic actions until a valid topic has loaded.

## Reusable topic presentation

Create `src/components/topics/TopicItem.vue`, following the typed prop-driven
pattern of `src/components/modules/lists/ContentItem.vue`.

- Leave the existing `src/components/modules/lists/TopicItem.vue` untouched: it
  serves the legacy sidebar and includes visualization-store behavior.
- Export `TopicItemProps` with a typed `topic` prop and optional display controls:
  `showTitle`, `showLink`, `showLanguage`, `showModel`, `showCount`, `showId`, and
  `showDescription`. Provide an `actions` slot and a typed `click` event.
- Render the loaded topic in the detail header, with its self-link disabled.
- Prefer `label`, then `longLabel`, then a words-based excerpt, finally the ID.
  Use `contentItemsCount`, not `countItems`; handle missing fields and unknown
  counts without displaying `undefined` or negative placeholder counts.
- Keep it presentational: no service calls, route mutations, or visualization
  store changes. Reuse existing topic word/label presentation where appropriate.
- Add colocated Storybook stories for a labeled topic, a legacy words-only topic,
  and missing optional metadata, following the Storybook agent instructions.

## Data and interaction behavior

- Watch `route.params.topic_id` immediately; load through `topicsService.get()`
  and normalize with the existing `Topic` model. Clear previous-topic state and
  ignore stale responses when navigating quickly between topics.
- Preserve `?tab=overview` and `?tab=articles`; missing or invalid values select
  overview. Watch relevant inputs rather than the entire route. Tab, sort, or
  pagination changes must not refetch the topic itself.
- Overview uses the existing year facet/timeline conversion and configured
  `facetTypes`. Preserve the document-year domain and topic-only filters.
- Articles use `contentItemsService.find()` with a topic filter, `limit: 10`,
  explicit `offset`, and the four existing relevance/date ordering options.
  Render canonical results with `modules/lists/ContentItem.vue`, removing the
  page's `Article.fromContentItem()` adapter and legacy `ArticleItem` dependency.
- Read totals from `response.pagination.total`. Keep the displayed page in sync
  with returned offset/limit; reset to page 1 on topic or ordering changes.
- Preserve “add to current filters” without duplicate topic filters and “search
  more” with a correctly serialized topic query. Preserve unrelated query state
  when changing tabs; do not enable the currently commented-out search-filter UI.

## Acceptance checks

- Direct public links and both tabs work; `/topics` and its graph/sidebar remain
  unchanged. Invalid/missing topics show an error rather than stale content.
- Topic A → B navigation cannot display late responses belonging to A.
- Overview still renders words, timeline, and facets, including empty results.
- Article pagination changes the offset and selected page; sorting resets both
  to page 1 without duplicate requests. Loading/error states clear correctly.
- Filter actions preserve existing filters, avoid duplicates, and link to search.
- Component tests cover label fallbacks, optional fields, display props, and links;
  page tests cover loading, errors, tabs, pagination, sorting, and stale requests.
- Run targeted Vitest tests, `npm run type-check`, and lint on changed files.

Implemented in `src/pages/TopicDetailPage.vue` and
`src/components/topics/TopicItem.vue`, with colocated regression tests and item
stories. The topics shell, explorer, and legacy sidebar item remain unchanged.
