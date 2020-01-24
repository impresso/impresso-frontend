
const namedEntitiesToListOfIds = namedEntities => namedEntities
  .reduce((ids, { uid, relevance }) => ids.concat(Array.from({length: relevance}, () => uid)), []);

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
  const personIds = namedEntitiesToListOfIds(response.persons || []);
  const locationIds = namedEntitiesToListOfIds(response.locations || []);

  const personOffsets = getOffsets(response, 'person');
  const locationOffsets = getOffsets(response, 'location');

  const personEntities = getNamedEntities(personIds, personOffsets, 'person');
  const locationEntities = getNamedEntities(locationIds, locationOffsets, 'location');

  return personEntities.concat(locationEntities);
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

const DefaultAnnotationConfiguration = {
  line: {
    start: () => '<p class="line">',
    end: () => '</p>'
  },
  region: {
    start: () => '<div class="region">',
    end: () => '</div>'
  },
  namedEntity: {
    start: (entity, isContinuation) => `<span class="entity ${entity.type}${isContinuation ? ' continuation' : ''}">`,
    end: () => '</span>'
  },
}

function getOpenTagForEntity(entity, configuration, isContinuation = false) {
  const tagTemplate = configuration[entity.kind]['start'];
  return tagTemplate(entity, isContinuation);
}

function getCloseTagForEntity(entity, configuration, isContinuation = false) {
  const tagTemplate = configuration[entity.kind]['end'];
  return tagTemplate(entity, isContinuation);
}

const getEntitiesForPosition = (entities, position) => entities
  .filter(({ offset: { start, end }}) => position >= start && position <= end)
  .sort(({ kind: kindA }, { kind: kindB }) => {
    const [priorityA, priorityB] = [kindA, kindB].map(i => SpecialEntitiesPriorityOrder.indexOf(i));
    return priorityB - priorityA;
  });

export function annotateText(text, entities, lineBreaks, regionBreaks, configuration = DefaultAnnotationConfiguration) {
  const expandedEntities = expandAndSortEntitiesAndBreaks(entities, lineBreaks, regionBreaks, text.length);
  const breakpoints = [...new Set(expandedEntities.map(({ offset: { start, end }}) => [start, end]).flat().sort((a, b) => a - b))]

  const items = breakpoints.reduce((acc, breakpoint, idx) => {
    let items = []
    const entities = getEntitiesForPosition(expandedEntities, breakpoint);
    const subtext = idx < breakpoints.length - 1 ? text.slice(breakpoint, breakpoints[idx + 1]) : undefined
    const specialEntities = entities
      .filter(({ kind }) => SpecialEntitiesPriorityOrder.includes(kind))
    const otherEntities = entities
      .filter(({ kind }) => !SpecialEntitiesPriorityOrder.includes(kind))

    const closeSpecialEntities = specialEntities.filter(({ offset: { end }}) => end === breakpoint).reverse()
    const openSpecialEntities = specialEntities.filter(({ offset: { start }}) => start === breakpoint)

    const sorter = (a, b) => {
      if (a.offset.end === breakpoint) return -1
      if (b.offset.end === breakpoint) return 1
      if (a.offset.start === breakpoint) return -1
      if (b.offset.start === breakpoint) return -1
      return 0
    }
    const openOtherEntities = otherEntities
      .filter(({ offset: { start }}) => start === breakpoint)
      .sort(sorter)
    const closeOtherEntities = otherEntities
      .filter(({ offset: { end }}) => end === breakpoint)
      .sort(sorter)

    const entityWontBeUsed = entity => !openOtherEntities.includes(entity) && !closeOtherEntities.includes(entity)

    closeOtherEntities.forEach(entity => {
      items.push(getCloseTagForEntity(entity, configuration, false))
    })

    if (closeSpecialEntities.length > 0) {
      otherEntities.filter(entityWontBeUsed).forEach(entity => {
        const tag = getCloseTagForEntity(entity, configuration, true)
        items.push(tag)
      })
    }
    closeSpecialEntities.forEach(entity => {
      const tag = getCloseTagForEntity(entity, configuration, false)
      items.push(tag)
    })

    openSpecialEntities.forEach(entity => {
      const tag = getOpenTagForEntity(entity, configuration, false)
      items.push(tag)
    })
    if (openSpecialEntities.length > 0) {
      otherEntities.filter(entityWontBeUsed).forEach(entity => {
        const tag = getOpenTagForEntity(entity, configuration, true)
        items.push(tag)
      })
    }

    openOtherEntities.forEach(entity => {
      items.push(getOpenTagForEntity(entity, configuration, false))
    })

    if (subtext !== undefined) items.push(subtext)

    // console.info('^^', {
    //   closeSpecialEntities,
    //   openSpecialEntities,
    //   openOtherEntities,
    //   closeOtherEntities,
    //   otherEntities,
    //   subtext,
    //   items
    // });

    return acc.concat(items)
  }, []);

  return items;
}