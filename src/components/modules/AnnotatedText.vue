<script lang="tsx">
import { defineComponent, PropType } from 'vue'

interface Entity {
  kind: string
  offset: { start: number; end: number }
  clusterId?: string
  type?: string
  id?: string
}

export interface Child {
  entity: Entity
  children: (Child | string)[]
  isContinuation?: boolean
  isLast?: boolean
}

type ColourMap = Record<string, string>

export interface Props {
  children: Child[]
  clusterColours: ColourMap
  selectedClusterId?: string
}

export interface RenderProps extends Props {
  onClusterSelected: (clusterId: string, entityId: string) => void
  onPassageClicked: (clusterId: string, passageId: string) => void
  onPassageMouseenter: (clusterId: string, passageId: string, event: MouseEvent) => void
  onPassageMouseleave: (clusterId: string, passageId: string, event: MouseEvent) => void
}

const isChild = (item: Child | string): item is Child => {
  return typeof item !== 'string' && 'entity' in item
}

const getItemTag = (item: Child) => {
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

const getItemClasses = (item: Child) => {
  switch (item.entity.kind) {
    case 'namedEntity':
      return `entity ${item.entity.type}${item.isContinuation ? ' continuation' : ''}`
    case 'passage':
      return `tr-passage ${item.isContinuation ? ' continuation' : ''}`
    default:
      return item.entity.kind
  }
}

const getItemStyles = (item: Child, colourMap: ColourMap) => {
  switch (item.entity.kind) {
    case 'passage':
      return { backgroundColor: colourMap[item.entity.clusterId] }
    default:
      return {}
  }
}

const getDataId = (item: Child) => (item.entity.id != null ? item.entity.id : undefined)

const flattenChildrenDeep = (children: (Child | string)[]) =>
  children.flatMap(child => {
    if (isChild(child) && child.children.length > 0)
      return [child].concat(flattenChildrenDeep(child.children))
    return child
  })

const getBorderlinePassages = (item: Child) => {
  const passages = flattenChildrenDeep(item.children).filter(
    child => child.entity && child.entity.kind === 'passage'
  )
  const startingPassages = passages.filter(
    ({ isLast, isContinuation }) => !isLast && !isContinuation
  )
  const finishingPassages = passages.filter(({ isLast }) => isLast)

  return startingPassages.concat(finishingPassages)
}

const getClusterTagStyle = (entity: Entity, colourMap: ColourMap, offsetRight: number) => {
  const borderColor = colourMap[entity.clusterId]
  const right = (offsetRight + 1) * 8 + 'px'
  return { borderColor, right }
}
const getClusterInnerTagStyle = (props: RenderProps, entity: Entity, colourMap: ColourMap) => {
  const backgroundColor =
    props.selectedClusterId === entity.clusterId ? colourMap[entity.clusterId] : 'transparent'
  return { backgroundColor }
}

const getClusterTitle = (props: RenderProps, clusterId: string) => {
  const select = props.selectedClusterId === clusterId ? 'unselect' : 'select'
  return select + ' this passage'
}

const getClusterClass = (isLast: boolean) =>
  isLast ? 'cluster-tag ending' : 'cluster-tag starting'

const renderChildren = (props: RenderProps, child: Child) => (
  <annotated-text
    children={child.children}
    cluster-colours={props.clusterColours}
    selected-cluster-id={props.selectedClusterId}
    onClusterSelected={props.onClusterSelected}
    onPassageClicked={props.onPassageClicked}
    onPassageMouseenter={props.onPassageMouseenter}
    onPassageMouseleave={props.onPassageMouseleave}
  />
)

const renderClusterTags = (props: RenderProps, child: Child) => {
  if (child.entity.kind !== 'line') return ''

  const clusterIndexes = Object.keys(props.clusterColours ?? {})
  const getClusterIndex = clusterId => clusterIndexes.indexOf(clusterId)

  const borderlinePassages = getBorderlinePassages(child)

  return borderlinePassages.map(({ entity, isLast }) => (
    <span
      title={getClusterTitle(props, entity.clusterId)}
      class={getClusterClass(isLast)}
      style={getClusterTagStyle(entity, props.clusterColours, getClusterIndex(entity.clusterId))}
      onClick={() => props.onClusterSelected(entity.clusterId, entity.id)}
    >
      <span class="select" style={getClusterInnerTagStyle(props, entity, props.clusterColours)} />
    </span>
  ))
}

const renderVericalLine = (props: RenderProps, child: Child) => {
  if (child.entity.kind !== 'passage') return

  const clusterIndexes = Object.keys(props.clusterColours ?? {})
  const getClusterIndex = clusterId => clusterIndexes.indexOf(clusterId)
  const offsetRight = getClusterIndex(child.entity.clusterId)
  const backgroundColour = props.clusterColours?.[child.entity.clusterId]

  return (
    <span
      class="vertical-line"
      style={`background-color: ${backgroundColour}; right: ${(offsetRight + 1) * 8}px`}
    />
  )
}

export default defineComponent({
  name: 'annotated-text',
  functional: true,
  props: {
    children: {
      type: Array as PropType<Child[]>,
      default: () => []
    },
    clusterColours: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({})
    },
    selectedClusterId: String
  },
  emits: ['clusterSelected', 'passageClicked', 'passageMouseenter', 'passageMouseleave'],
  render(_, __, opts) {
    const { children, clusterColours, selectedClusterId } = opts
    const props = {
      children,
      clusterColours,
      selectedClusterId,
      onClusterSelected: (clusterId, entityId) => {
        this.$emit('clusterSelected', clusterId, entityId)
      },
      onPassageClicked: (clusterId, passageId) => {
        this.$emit('passageClicked', clusterId, passageId)
      },
      onPassageMouseenter: (clusterId, passageId, event) => {
        this.$emit('passageMouseenter', clusterId, passageId, event)
      },
      onPassageMouseleave: (clusterId, passageId, event) => {
        this.$emit('passageMouseleave', clusterId, passageId, event)
      }
    } satisfies RenderProps
    return (children || []).map(child => {
      if (typeof child === 'string') return child

      if (child.entity.kind === 'passage' && child.entity.clusterId !== props.selectedClusterId) {
        return [
          renderChildren(props, child),
          renderClusterTags(props, child),
          renderVericalLine(props, child)
        ]
      }

      const Tag = getItemTag(child)
      return (
        <Tag
          class={getItemClasses(child)}
          data-id={getDataId(child)}
          style={getItemStyles(child, props.clusterColours)}
          onClick={() => {
            if (child.entity.kind === 'passage') {
              props.onPassageClicked(child.entity.clusterId, child.entity.id)
            }
          }}
          onMouseenter={(e: MouseEvent) => {
            if (child.entity.kind === 'passage') {
              props.onPassageMouseenter(child.entity.clusterId, child.entity.id, e)
            }
          }}
          onMouseleave={(e: MouseEvent) => {
            if (child.entity.kind === 'passage') {
              props.onPassageMouseleave(child.entity.clusterId, child.entity.id, e)
            }
          }}
        >
          {renderChildren(props, child)}
          {renderClusterTags(props, child)}
          {renderVericalLine(props, child)}
        </Tag>
      )
    })
  }
})
</script>

<style lang="scss">
p.line {
  position: relative;
  margin-bottom: 0;
  .vertical-line {
    position: absolute;
    height: calc(100% + 2px);
    width: 2px;
    margin-right: -20px;
    pointer-events: none;
  }

  .tr-passage {
    opacity: 0.8;
    transition: opacity 0.2s ease;
    cursor: pointer;

    &.active {
      opacity: 1;
    }
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
