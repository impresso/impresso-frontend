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

const getItemStyles = (item, colourMap) => {
  switch (item.entity.kind) {
  case 'passage':
    return { backgroundColor: colourMap[item.entity.clusterId] }
  default:
    return {}
  }
}

const getDataId = item => item.entity.id != null ? item.entity.id : undefined

const flattenChildrenDeep = children => children.flatMap(child => (Array.isArray(child.children) && child.children.length) > 0 ? [child].concat(flattenChildrenDeep(child.children)) : child)


const getBorderlinePassages = item => {
  const passages = flattenChildrenDeep(item.children)
    .filter(child => child.entity && child.entity.kind === 'passage')
  const startingPassages = passages
    .filter(({ isLast, isContinuation }) => !isLast && !isContinuation)
  const finishingPassages = passages
    .filter(({ isLast }) => isLast)

  return startingPassages.concat(finishingPassages)
}

const getClusterTagStyle = (entity, colourMap) => {
  const backgroundColor = colourMap[entity.clusterId]
  return { backgroundColor }
}

const StartPassageTag = 'S'
const EndPassageTag = 'E'

const getPassageTag = isLast => isLast ? EndPassageTag : StartPassageTag

const renderChildren = (h, context, child) => (
  <annotated-text
    children={child.children}
    cluster-colours={context.props.clusterColours}
    selected-cluster-id={context.props.selectedClusterId}/>
)

const renderClusterTags = (h, context, child) => {
  if (child.entity.kind !== 'line') return ''

  const { onClusterSelected = (() => ({})) } = context.listeners

  return getBorderlinePassages(child).map(({ entity, isLast }) => (
    <span
      class="cluster-tag m-1"
      style={getClusterTagStyle(entity, context.props.clusterColours)}
      onClick={() => onClusterSelected(entity.clusterId)}>
      {getPassageTag(isLast)}
    </span>
  ))
}

export default {
  name: 'annotated-text',
  functional: true,
  props: {
    children: Array,
    clusterColours: {
      type: Object,
      default: () => ({})
    },
    selectedClusterId: String
  },
  render (h, context) {
    return (context.props.children || []).map(child => {
      if (typeof child === 'string') return child

      if (child.entity.kind === 'passage' && child.entity.clusterId !== context.props.selectedClusterId) {
	return [
	  renderChildren(h, context, child),
	  renderClusterTags(h, context, child)
	]
      }

      const Tag = getItemTag(child)
      return (
	<Tag
	  class={getItemClasses(child)}
	  data-id={getDataId(child)}
	  style={getItemStyles(child, context.props.clusterColours)}>
	  {renderChildren(h, context, child)}
	  {renderClusterTags(h, context, child)}
	</Tag>
      )
    })
  }
}
</script>

<style>
  .cluster-tag {
    font-weight: bold;
    width: 1em;
    display: inline-block;
    text-align: center;
    color: #333;
    cursor: pointer;
  }
</style>
