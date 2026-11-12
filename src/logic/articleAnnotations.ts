
import type { ContentItem } from '@/models/generated/canonical/contentItem'

export interface AnnotationEntity {
  kind: string
  offset: { start: number; end: number }
  id?: string
  type?: string
  clusterId?: string
}

export interface NamedEntityAnnotation extends AnnotationEntity {
  id: string
  kind: 'namedEntity'
  type: string
}

export interface PassageAnnotation extends AnnotationEntity {
  id: string
  clusterId: string
  kind: 'passage'
  type: 'passage'
}

export interface AnnotationNode {
  entity: AnnotationEntity
  children: AnnotationTreeChild[]
  isContinuation?: boolean
  isLast?: boolean
}

export type AnnotationTreeChild = AnnotationNode | string

export interface AnnotationTree {
  children: AnnotationTreeChild[]
}

interface PendingNode {
  entity: AnnotationEntity
  children: PendingNode[]
  isContinuation?: boolean
  isLast?: boolean
}

interface PendingRoot {
  children: PendingNode[]
}

type MentionOffset = [start: number, length: number]
type MentionField = 'person' | 'location'

interface ArticleResponse {
  mentions: (Partial<Record<MentionField, MentionOffset[]>> | null | undefined)[]
}

interface Passage {
  id: string
  clusterId: string
  offsetStart: number
  offsetEnd: number
}

const getNamedEntities = (ids: string[], offsets: MentionOffset[], type: string): NamedEntityAnnotation[] => ids.map((id, index) => {
  const [offset, length] = offsets[index];
  return {
    id: id,
    kind: 'namedEntity',
    type: type,
    offset: { start: offset, end: offset + length }
  };
});

const getOffsets = (response: ArticleResponse, field: MentionField): MentionOffset[] => {
  const items = response.mentions
    .filter(o => o != null && o[field] !== undefined)
  return items.length > 0 ? items[0][field] : [];
}

const MENTION_TYPE_TO_ENTITY_TYPE: Readonly<Record<string, string>> = Object.freeze({
  persons: 'person',
  locations: 'location',
  organisations: 'organisation',
  newsagencies: 'newsagency'
});

/**
 * Extract named entity annotations from a canonical `ContentItem`'s semantic
 * enrichments. Mentions carry absolute `startOffset` / `endOffset`, so unlike
 * `getNamedEntitiesFromArticleResponse` no offset/length pairing is needed.
 */
export function getNamedEntitiesFromContentItem(contentItem: ContentItem): NamedEntityAnnotation[] {
  const mentions = contentItem?.semanticEnrichments?.mentions ?? {};

  return Object.entries(mentions).flatMap(([mentionType, items]) => {
    const type = MENTION_TYPE_TO_ENTITY_TYPE[mentionType] ?? mentionType;
    return (items || [])
      .filter(item => item != null && item.startOffset !== undefined && item.endOffset !== undefined)
      .map((item, index): NamedEntityAnnotation => ({
        id: `${type}-${index}`,
        kind: 'namedEntity',
        type,
        offset: { start: item.startOffset, end: item.endOffset }
      }));
  });
}

export function getNamedEntitiesFromArticleResponse(response: ArticleResponse): NamedEntityAnnotation[] {
  const personOffsets = getOffsets(response, 'person');
  const locationOffsets = getOffsets(response, 'location');

  // NOTE: "location" and "person" entities do not correspond to the mentions offsets
  // in another field. This means that some of the entities mentioned have not
  // been disambiguated and we cannot rely on mention -> entity match. Until this
  // is fixed we use mentions indexes as IDs.
  const personIds = personOffsets.map((_, index) => `person-${index}`);
  const locationIds = locationOffsets.map((_, index) => `location-${index}`);

  const personEntities = getNamedEntities(personIds, personOffsets, 'person');
  const locationEntities = getNamedEntities(locationIds, locationOffsets, 'location');

  return personEntities.concat(locationEntities);
}

export function passageToPassageEntity(passage: Passage): PassageAnnotation {
  return {
    id: passage.id,
    clusterId: passage.clusterId,
    kind: 'passage',
    type: 'passage',
    offset: { start: passage.offsetStart, end: passage.offsetEnd }
  }
}

const SpecialEntitiesPriorityOrder = ['line', 'region'];

function expandEntitiesAndBreaks(
  entities: AnnotationEntity[],
  lineBreaks: number[],
  regionBreaks: number[],
  textLength: number
): AnnotationEntity[] {
  const lineEntities: AnnotationEntity[] = lineBreaks.map((breakpoint, index) => {
    const offset = index === 0
      ? { start: 0, end: breakpoint }
      : { start: lineBreaks[index - 1], end: breakpoint };
    return { kind: 'line', offset };
  }).concat({
    kind: 'line', offset: {
      start: lineBreaks.length > 0 ? lineBreaks[lineBreaks.length - 1] : 0,
      end: textLength
    }
  });

  const regionEntities: AnnotationEntity[] = regionBreaks.map((breakpoint, index) => {
    const offset = index === 0
      ? { start: 0, end: breakpoint - 1 }
      : { start: regionBreaks[index - 1] - 1, end: breakpoint - 1 }
    return { kind: 'region', offset };
  }).concat({
    kind: 'region', offset: {
      start: regionBreaks.length > 0 ? regionBreaks[regionBreaks.length - 1] - 1 : 0,
      end: textLength
    }
  });

  return entities
    .concat(lineEntities)
    .concat(regionEntities)
}

function withTextParts(
  children: PendingNode[],
  text: string,
  startOffset: number,
  endOffset: number
): AnnotationTreeChild[] {
  let lastOffset = startOffset
  const childrenWithText: AnnotationTreeChild[] = []

  for (const child of children) {
    const { start, end } = child.entity.offset
    if (start - lastOffset > 0) {
      childrenWithText.push(text.slice(lastOffset, start))
    }
    childrenWithText.push({
      ...child,
      children: withTextParts(
        child.children,
        text,
        lastOffset > start ? lastOffset : start,
        endOffset < end ? endOffset : end
      )
    })
    lastOffset = end
  }

  if (endOffset - lastOffset > 0) {
    childrenWithText.push(text.slice(lastOffset, endOffset))
  }

  return childrenWithText
}

export function getAnnotateTextTree(
  text: string,
  entities: AnnotationEntity[],
  lineBreaks: number[],
  regionBreaks: number[]
): AnnotationTree {
  const expandedEntities = expandEntitiesAndBreaks(entities, lineBreaks, regionBreaks, text.length);

  const sortedEntities = expandedEntities
    .sort(({ offset: offsetA }, { offset: offsetB }) => {
      if (offsetA.start !== offsetB.start) return offsetA.start - offsetB.start
      const [lengthA, lengthB] = [offsetA, offsetB].map(({ start, end }) => end - start)
      return lengthB - lengthA
    })
    .sort(({ kind: kindA }, { kind: kindB }) => {
      const [priorityA, priorityB] = [kindA, kindB].map(i => SpecialEntitiesPriorityOrder.indexOf(i));
      return priorityB - priorityA;
    })

  const breakpoints = [...new Set(sortedEntities.map(({ offset: { start, end } }) => [start, end]).flat().sort((a, b) => a - b))]

  const rootItem: PendingRoot = { children: [] };
  let itemsStack: (PendingRoot | PendingNode)[] = [rootItem];

  const isInStack = (entity: AnnotationEntity) => itemsStack.some(item =>
    JSON.stringify(entity) === JSON.stringify('entity' in item ? item.entity : undefined)
  )

  const getEntitiesMatchingBreakpoint = (entities: AnnotationEntity[], breakpoint: number) => entities
    .filter(({ offset: { start, end } }) => breakpoint >= start && breakpoint < end)

  breakpoints.map(breakpoint => {
    let closeIndex: number | undefined
    itemsStack.forEach((item, index) => {
      if (closeIndex === undefined && 'entity' in item && item.entity.offset.end <= breakpoint) closeIndex = index
    })

    if (closeIndex != null) {
      const finishedItems = itemsStack.filter((item): item is PendingNode =>
        'entity' in item && item.entity.offset.end <= breakpoint
      )
      itemsStack = itemsStack.slice(0, closeIndex)
      finishedItems.forEach(item => { item.isLast = true })
    }

    const matchingEntities = getEntitiesMatchingBreakpoint(sortedEntities, breakpoint)

    matchingEntities.forEach(entity => {
      if (!isInStack(entity)) {
        const isContinuation = entity.offset.start < breakpoint
        const item = { entity, children: [], isContinuation }
        itemsStack[itemsStack.length - 1].children.push(item)
        itemsStack.push(item)
      }
    })
  });

  return { children: withTextParts(rootItem.children, text, 0, text.length) }
}