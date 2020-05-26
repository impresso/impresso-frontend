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

const getClusterTagStyle = (entity, colourMap, offsetRight) => {
  const borderColor = colourMap[entity.clusterId];
  const right = (offsetRight * 8) + 'px';
  return { borderColor, right }
}
const getClusterInnerTagStyle = (context, entity, colourMap) => {
  const backgroundColor = context.props.selectedClusterId === entity.clusterId ? colourMap[entity.clusterId] : 'transparent';
  return { backgroundColor }
}

const getClusterTitle = (context, clusterId) => {
  const select = context.props.selectedClusterId === clusterId ? 'unselect' : 'select';
  return select + ' passage with cluster ID ' + clusterId
}

const getClusterClass = isLast => isLast ? 'cluster-tag ending' : 'cluster-tag starting';

const renderChildren = (h, context, child) => (
  <annotated-text
    children={child.children}
    cluster-colours={context.props.clusterColours}
    selected-cluster-id={context.props.selectedClusterId}/>
)

const renderClusterTags = (h, context, child) => {
  if (child.entity.kind !== 'line') return ''

  const { onClusterSelected = (() => ({})) } = context.listeners

  const clusterIndexes = Object.keys(context.props.clusterColours);
  const getClusterIndex = clusterId => clusterIndexes.indexOf(clusterId);

  return getBorderlinePassages(child).map(({ entity, isLast }) => (
    <span
      title={getClusterTitle(context, entity.clusterId)}
      class={getClusterClass(isLast)}
      style={getClusterTagStyle(entity, context.props.clusterColours, getClusterIndex(entity.clusterId))}
      onClick={() => { onClusterSelected(entity.clusterId); }}>
      <span class="select" style={getClusterInnerTagStyle(context, entity, context.props.clusterColours)} />
    </span>
  ))
}

const renderVericalLine = (h, context, child) => {

  if (child.entity.kind !== 'passage') return;

  const clusterIndexes = Object.keys(context.props.clusterColours);
  const getClusterIndex = clusterId => clusterIndexes.indexOf(clusterId);
  const offsetRight = getClusterIndex(child.entity.clusterId);

  return <span class="vertical-line" style={`backgroundColor: ${context.props.clusterColours[child.entity.clusterId]}; right: ${(offsetRight * 8)}px`} />
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
          renderClusterTags(h, context, child),
          renderVericalLine(h, context, child)
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
          {renderVericalLine(h, context, child)}
        </Tag>
      )
    })
  }
}
</script>

<style lang="scss">
  p.line {
    position: relative;
    .vertical-line {
      position: absolute;
      height: calc(100% + 2px);
      width: 2px;
      margin-right: -20px;
      pointer-events: none;
    }
  }
  .cluster-tag {
    position: absolute;
    width: 12px;
    height: 12px;
    margin-right: -25px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid;
    background: white;
    &:hover {
      transform: scale(1.5);
      z-index: 1;
    }
    .select {
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      margin: 2px;
    }
    &.ending {
      top: 16px;
    }
  }
</style>
