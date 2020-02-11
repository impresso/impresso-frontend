<script>

const getItemTag = item => {
  switch (item.entity.kind) {
  case 'line':
    return 'p'
  case 'namedEntity':
  case 'passage':
    return 'span'
  default:
    return 'div'
  }
}

const getItemClasses = item => {
  switch (item.entity.kind) {
  case 'namedEntity':
    return `entity ${item.entity.type}${item.isContinuation ? ' continuation' : ''}`
  case 'passage':
    return `tr-passage ${item.isContinuation ? ' continuation' : ''}`
  default:
    return item.entity.kind
  }
}

const getDataId = item => item.entity.id != null ? item.entity.id : undefined

const flattenChildrenDeep = children => children.flatMap(child => (Array.isArray(child.children) && child.children.length) > 0 ? [child].concat(flattenChildrenDeep(child.children)) : child)


const getStartingAndFinishingPassages = item => {
  const passages = flattenChildrenDeep(item.children)
    .filter(child => child.entity && child.entity.kind === 'passage')
  const startingPassages = passages
    .filter(({ isLast, isContinuation }) => !isLast && !isContinuation)
  const finishingPassages = passages
    .filter(({ isLast }) => isLast)

  return { startingPassages, finishingPassages }
}

const TagColourPalette = [
  '#b7effb',
  '#c7f2cc',
  '#e3c6f0',
  '#fdd0e4',
  '#baf6ff'
]

const getColour = (/*entity*/) => {
  const index = Math.floor(Math.random() * TagColourPalette.length)
  return TagColourPalette[index]
}

export default {
  name: 'annotated-text',
  functional: true,
  props: {
    children: Array
  },
  render (h, context) {
    return (context.props.children || []).map(child => {
      if (typeof child === 'string') return child

      const Tag = getItemTag(child)
      const isLine = false // WIP
      // const isLine = child.entity.kind === 'line'

      const { startingPassages, finishingPassages } = getStartingAndFinishingPassages(child)

      return (
        <Tag class={getItemClasses(child)} data-id={getDataId(child)}>
          <annotated-text children={child.children}/>
          {
            isLine ? startingPassages.map(({ entity }) => <span style={`color: ${getColour(entity)}`}>&rarr;</span>) : ''
          }
          {
            isLine ? finishingPassages.map(({ entity }) => <span style={`color: ${getColour(entity)}`}>&larr;</span>) : ''
          }
        </Tag>
      )
    })
  }
}
</script>