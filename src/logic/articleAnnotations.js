
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

export function getNamedEntitiesFromArticleResponse(response) {
  const personIds = namedEntitiesToListOfIds(response.persons || []);
  const locationIds = namedEntitiesToListOfIds(response.locations || []);
  const personOffsets = response.mentions.filter(({ person }) => person !== undefined)[0].person;
  const locationOffsets = response.mentions.filter(({ location }) => location !== undefined)[0].location;

  const personEntities = getNamedEntities(personIds, personOffsets, 'person');
  const locationEntities = getNamedEntities(locationIds, locationOffsets, 'location');

  return personEntities.concat(locationEntities);
}

export function splitTextByLineBreaks(text, lineBreaks) {
  const items = lineBreaks.map((breakpoint, index) => {
    if (index === 0) return text.slice(0, breakpoint);
    return text.slice(lineBreaks[index - 1], breakpoint);
  });
  return items.concat(text.slice(lineBreaks[lineBreaks.length - 1], text.length));
}

function expandAndSortEntitiesAndBreaks(entities, lineBreaks, textLength) {
  const lineEntities = lineBreaks.map((breakpoint, index) => {
    const offset = index === 0
      ? { start: 0, end: breakpoint }
      : { start: lineBreaks[index - 1], end: breakpoint }
    return { kind: 'line', offset }
  }).concat({ kind: 'line', offset: { start: lineBreaks[lineBreaks.length - 1], end: textLength }})

  const sortedEntities = entities.concat(lineEntities).sort((entityA, entityB) => {
    // sort by start offset
    const startDiff = entityA.offset.start - entityB.offset.start;
    if (startDiff !== 0) return startDiff;
    
    // then by length
    const lengthA = entityA.offset.end - entityA.offset.start;
    const lengthB = entityB.offset.end - entityB.offset.start;
    const lengthDiff = lengthA - lengthB;
    if (lengthDiff !== 0) return lengthDiff;

    // then 'line' kind takes priority
    if (entityA.kind === 'line' && entityA.kind == entityB.kind) return 0;
    if (entityA.kind === 'line') return -1;
    return 1;
  });

  return sortedEntities;
}

function unwindEntities(entities) {
  const stack = []
  const items = entities.reduce((acc, entity) => {
    if (stack.length === 0) {
      stack.push(entity);
      return acc.concat([
        { offset: entity.offset.start, position: 'start', entity }
      ]);
    }

    let items = []
    while(stack.length > 0 && stack[stack.length -1].offset.end <= entity.offset.start) {
      const mostRecentStackEntity = stack.pop();
      items = items.concat([
        { offset: mostRecentStackEntity.offset.end, position: 'end', entity: mostRecentStackEntity }
      ])
    }
    stack.push(entity);
    items = items.concat([
      { offset: entity.offset.start, position: 'start', entity }
    ])

    return acc.concat(items);
  }, []);
  const stackItems = stack.reverse().map(entity => ({
    offset: entity.offset.end,
    position: 'end',
    entity
  }))

  return items.concat(stackItems);
}

const DefaultAnnotationConfiguration = {
  line: {
    start: () => '<p class="line">',
    end: () => '</p>'
  },
  namedEntity: {
    start: (entity, isContinuation) => `<span class="entity ${entity.type}${isContinuation ? ' continuation' : ''}">`,
    end: () => '</span>'
  },
}

function getTagForEntity(tagEntity, configuration, isContinuation = false) {
  const tagTemplate = configuration[tagEntity.entity.kind][tagEntity.position];
  return tagTemplate(tagEntity.entity, isContinuation);
}

function getOpenTagForEntity(tagEntity, configuration, isContinuation = false) {
  const tagTemplate = configuration[tagEntity.entity.kind]['start'];
  return tagTemplate(tagEntity.entity, isContinuation);
}

function getCloseTagForEntity(tagEntity, configuration, isContinuation = false) {
  const tagTemplate = configuration[tagEntity.entity.kind]['end'];
  return tagTemplate(tagEntity.entity, isContinuation);
}

export function annotateText(text, entities, lineBreaks, configuration = DefaultAnnotationConfiguration) {
  const expandedEntities = expandAndSortEntitiesAndBreaks(entities, lineBreaks, text.length);
  const unwoundEntities = unwindEntities(expandedEntities);

  const tagStack = [];

  return unwoundEntities.reduce((annotatedTextItems, tagEntity, index) => {
    let items = [];

    if (tagEntity.position === 'end' && tagEntity.entity.kind === 'line') {
      const extraEndTags = tagStack
        .map(openTag => getCloseTagForEntity(openTag, configuration, true))
      items = items.concat(extraEndTags.slice(0, extraEndTags.length - 1));
    }

    items = items.concat([getTagForEntity(tagEntity, configuration)]);

    if (tagEntity.position === 'start' && tagEntity.entity.kind === 'line') {
      const extraStartTags = tagStack
        .map(openTag => getOpenTagForEntity(openTag, configuration, true));
      items = items.concat(extraStartTags);
    }

    if (tagEntity.position === 'start') {
      const nextTagEntity = unwoundEntities[index + 1]
      if (tagEntity.offset !== nextTagEntity.offset) {
        items = items.concat([text.slice(tagEntity.offset, nextTagEntity.offset)])
      }
    
      tagStack.push(tagEntity);
    }

    if (tagEntity.position === 'end') {
      if (tagEntity.entity.kind !== 'line') {
        const nextTagEntity = unwoundEntities[index + 1]
        if (tagEntity.offset !== nextTagEntity.offset) {
          items = items.concat([text.slice(tagEntity.offset, nextTagEntity.offset)])
        }
      }

      tagStack.pop();
    }

    return annotatedTextItems.concat(items);
  }, []);
}