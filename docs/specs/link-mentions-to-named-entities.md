# Link content item mentions to named entities

Status: implemented.

## Goal

Move `getNamedEntitiesFromContentItem` from `src/logic/articleAnnotations.ts`
to a content-item-specific `src/logic/contentItemAnnotations.ts` module, and
update it to associate each mention with the named entity identified by its
`entityId`. Mentions without an entity link remain annotations in their own
right.

Update the import in `src/components/modules/IssueViewerText.vue` and the
relevant tests to use the new module. Keep shared annotation types and tree
logic in `src/logic/articleAnnotations.ts`; the content-item module can import
the shared types from there.

## Input

Canonical content items can contain both `semanticEnrichments.mentions` and
`semanticEnrichments.namedEntities`, grouped by types such as `persons`,
`locations`, `organisations`, and `newsagencies`. A mention has absolute
`startOffset` and `endOffset` values and may have an `entityId`. A named entity
has an `id`, and may also have a `label` and `count`.

For example, the location mention `Londres` with `entityId: "Q84"` links to
the named entity `{ id: "Q84", label: "London", count: 2 }`. Multiple
mentions can link to the same entity.

The generated `ContentItemMention` type in
`src/models/generated/canonical/contentItem.d.ts` currently does not declare
`entityId` or the mention's `id`. The content-item module uses a local
extension of that type for these optional fields. Generated declarations should
be updated through their source schema and generation process when available,
rather than relying on an edit that regeneration would overwrite.

## Required behavior

- For each mention with valid offsets and an `entityId`, find the named entity
  whose `id` matches that value. Do not infer the association from array
  positions, mention surface forms, or labels. The lookup covers all named
  entity groups, not only the group corresponding to the mention type.
- For a match, return an annotation with `kind: 'namedEntity'` and the matched
  entity's ID as its `id`. Preserve the mention's offsets and normalized type.
  Repeated mentions of the same entity yield separate annotations with their
  respective offsets.
- If an `entityId` is present but no named entity has that ID, emit a warning
  identifying the missing entity ID and return the annotation as an unlinked
  `mention`. Missing `namedEntities` or an absent relevant list must not cause
  an exception.
- If `entityId` is absent, return an annotation with `kind: 'mention'` without
  warning. For unlinked mentions, use the mention's `id` when present; otherwise
  use the existing `${type}-${index}` ID, with the index counted after
  filtering invalid mentions within each type.
- Continue filtering out null mentions and mentions missing either offset.
  Preserve absolute offsets, input ordering, the existing type normalization
  (`persons` to `person`, `locations` to `location`, `organisations` to
  `organisation`, and `newsagencies` to `newsagency`), and the fallback for
  other types.
- Missing semantic enrichments or mentions continue to produce an empty array.

## Transcript rendering

In the IIIF viewer transcript, `IssueViewerText.vue` builds an annotation tree
from the canonical content item and renders it with `AnnotatedTextTree.vue`.
The tree component:

- Wraps `namedEntity` content in `ItemSelector`, passing the annotation's
  entity ID and normalized type. Clicking it opens the selection monitor and
  does not trigger the surrounding region click.
- Uses the node's immediate text children as the selector item label, not the
  named entity's canonical label. Displays the entity-type icon except on
  continuation fragments.
- Renders `mention` content without an entity selector or entity icon; clicks
  can continue to the surrounding region.

The non-IIIF transcript uses `AnnotatedText.vue` instead; the selector behavior
above applies only to the `AnnotatedTextTree.vue` rendering path.

## Acceptance tests

In tests for `getNamedEntitiesFromContentItem` (currently in
`test/spec/logic/articleAnnotations.spec.js`), cover:

1. A linked person and location resolve by ID, even when entity and mention
   arrays have different order and surface forms differ from entity labels.
2. Multiple mentions of one entity retain their individual offsets and share
   the matched entity ID.
3. A mention without `entityId` produces kind `mention` without a warning.
4. An unknown `entityId`, including when the named-entity lists are absent,
   emits a warning containing the ID and yields an unlinked mention.
5. Missing offsets, null entries, empty enrichments, and type normalization
   retain their existing handling.

Rendering behavior can be verified separately: linked entities open the
selection monitor with their entity ID, while unlinked mentions do not.

## Scope

This concerns canonical content item mentions. The legacy
`getNamedEntitiesFromArticleResponse` function remains in
`src/logic/articleAnnotations.ts`, is marked deprecated, and retains its
different input contract and behavior. It must not be used as the
content-item implementation.
