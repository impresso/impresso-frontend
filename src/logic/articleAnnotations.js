
// const namedEntitiesToListOfIds = namedEntities => namedEntities
//   .reduce((ids, { uid, relevance }) => ids.concat(Array.from({length: relevance}, () => uid)), []);

const getNamedEntities = (ids, offsets, type) => ids.map((id, index) => {
  const [offset, length] = offsets[index];
  return {
    id: id,
    kind: 'namedEntity',
    type: type,
    offset: { start: offset, end: offset + length }
  };
});

const getOffsets = (response, field) => {
  const items = response.mentions
    .filter(o => o != null && o[field] !== undefined)
  return items.length > 0 ? items[0][field] : [];
}

export function getNamedEntitiesFromArticleResponse(response) {
  const personOffsets = getOffsets(response, 'person');
  const locationOffsets = getOffsets(response, 'location');

  // NOTE: "location" and "person" entities do not correspond to the metnions offsets
  // in another field. This means that some of the entities mentioned have not
  // been disambiguated and we cannot rely on mention -> entity match. Until this
  // is fixed we use mentions indexes as IDs.
  // const locationIds = namedEntitiesToListOfIds(response.locations || []);
  // const personIds = namedEntitiesToListOfIds(response.persons || []);

  const personIds = personOffsets.map((_, index) => `person-${index}`);
  const locationIds = locationOffsets.map((_, index) => `location-${index}`);

  const personEntities = getNamedEntities(personIds, personOffsets, 'person');
  const locationEntities = getNamedEntities(locationIds, locationOffsets, 'location');

  return personEntities.concat(locationEntities);
}

export function passageToPassageEntity(passage) {
  return {
    id: passage.id,
    kind: 'passage',
    type: 'passage',
    offset: { start: passage.offsetStart, end: passage.offsetEnd }
  }
}

const SpecialEntitiesPriorityOrder = ['line', 'region'];

function expandAndSortEntitiesAndBreaks(entities, lineBreaks, regionBreaks, textLength) {
  const lineEntities = lineBreaks.map((breakpoint, index) => {
    const offset = index === 0
      ? { start: 0, end: breakpoint }
      : { start: lineBreaks[index - 1], end: breakpoint };
    return { kind: 'line', offset };
  }).concat({ kind: 'line', offset: {
    start: lineBreaks.length > 0 ? lineBreaks[lineBreaks.length - 1] : 0,
    end: textLength
  }});

  const regionEntities = regionBreaks.map((breakpoint, index) => {
    const offset = index === 0
      ? { start: 0, end: breakpoint - 1 }
      : { start: regionBreaks[index - 1] - 1, end: breakpoint - 1 }
    return { kind: 'region', offset };
  }).concat({ kind: 'region', offset: {
    start: regionBreaks.length > 0 ? regionBreaks[regionBreaks.length - 1] - 1 : 0,
    end: textLength
  }});

  return entities
    .concat(lineEntities)
    .concat(regionEntities)
}

export const DefaultAnnotationConfiguration = Object.freeze({
  line: {
    start: () => '<p class="line">',
    end: () => '</p>'
  },
  region: {
    start: () => '<div class="region">',
    end: () => '</div>'
  },
  namedEntity: {
    start: (entity, isContinuation) => `<span class="entity ${entity.type}${isContinuation ? ' continuation' : ''}" ${entity.id ? `data-id="${entity.id}"` : ''}>`,
    end: () => '</span>'
  },
  passage: {
    start: (entity, isContinuation) => `<span class="tr-passage ${isContinuation ? ' continuation' : ''}" ${entity.id ? `data-id="${entity.id}"` : ''}>`,
    end: () => '</span>'
  }
})

const withTextParts = (item, text, [boundaryStart, boundaryEnd] = []) => {
  let [itemStartOffset, itemEndOffset] = item.entity != null
    ? [item.entity.offset.start, item.entity.offset.end]
    : [0, text.length]

  if (boundaryStart != null && boundaryStart > itemStartOffset) itemStartOffset = boundaryStart
  if (boundaryEnd != null && boundaryEnd < itemEndOffset) itemEndOffset = boundaryEnd

  let lastOffset = itemStartOffset

  const childrenWithText = item.children.reduce((acc, child) => {
    const { start, end } = child.entity.offset
    if (start - lastOffset > 0) {
      acc.push(text.slice(lastOffset, start))
    }
    acc.push(withTextParts(child, text, [itemStartOffset, itemEndOffset]))
    lastOffset = end
    return acc
  }, [])

  if (itemEndOffset - lastOffset > 0) {
    childrenWithText.push(text.slice(lastOffset, itemEndOffset))
  }

  item.children = childrenWithText

  return item
}

export function getAnnotateTextTree(text, entities, lineBreaks, regionBreaks) {
  const expandedEntities = expandAndSortEntitiesAndBreaks(entities, lineBreaks, regionBreaks, text.length);

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

  const breakpoints = [...new Set(sortedEntities.map(({ offset: { start, end }}) => [start, end]).flat().sort((a, b) => a - b))]

  const rootItem = { children: [] };
  let itemsStack = [rootItem];

  const isInStack = entity => itemsStack.filter(({ entity: e }) => JSON.stringify(entity) === JSON.stringify(e)).length > 0

  const getEntitiesMatchingBreakpoint = (entities, breakpoint) => entities
    .filter(({ offset: { start, end }}) => breakpoint >= start && breakpoint < end)

  breakpoints.map(breakpoint => {
    let closeIndex
    itemsStack.forEach(({ entity }, index) => {
      if (closeIndex === undefined && entity && entity.offset.end <= breakpoint) closeIndex = index
    })

    if (closeIndex != null) {
      const finishedItems = itemsStack.filter(({ entity }) => entity && entity.offset.end <= breakpoint)
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

  const rootItemWithText = withTextParts(rootItem, text)

  // console.info('root item with text', JSON.stringify(rootItemWithText, null, 2))

  return rootItemWithText
}