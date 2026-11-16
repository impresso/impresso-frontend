import type { ContentItem, ContentItemMention } from '@/models/generated/canonical/contentItem'
import type { NamedEntityAnnotation } from '@/logic/articleAnnotations'

type MentionWithEntity = ContentItemMention & {
  id?: string
  entityId?: string
}

const MENTION_TYPE_TO_ENTITY_TYPE: Readonly<Record<string, string>> = Object.freeze({
  persons: 'person',
  locations: 'location',
  organisations: 'organisation',
  newsagencies: 'newsagency'
})

/**
 * Extract annotations from canonical content item mentions using absolute offsets.
 */
export function getNamedEntitiesFromContentItem(contentItem: ContentItem): NamedEntityAnnotation[] {
  const mentions = contentItem?.semanticEnrichments?.mentions ?? {}
  const namedEntities = contentItem?.semanticEnrichments?.namedEntities ?? {}
  const entityIds = new Set(
    Object.values(namedEntities)
      .flat()
      .filter(entity => entity?.id != null)
      .map(entity => entity.id)
  )

  return Object.entries(mentions).flatMap(([mentionType, items]) => {
    const type = MENTION_TYPE_TO_ENTITY_TYPE[mentionType] ?? mentionType
    return (items || [])
      .filter(
        item => item != null && item.startOffset !== undefined && item.endOffset !== undefined
      )
      .map((item: MentionWithEntity, index): NamedEntityAnnotation => {
        const linked = item.entityId != null && entityIds.has(item.entityId)
        if (item.entityId != null && !linked) {
          console.warn(`Named entity not found for mention entityId: ${item.entityId}`)
        }

        return {
          id: linked ? item.entityId : (item.id ?? `${type}-${index}`),
          kind: linked ? 'namedEntity' : 'mention',
          type,
          offset: { start: item.startOffset, end: item.endOffset }
        }
      })
  })
}
