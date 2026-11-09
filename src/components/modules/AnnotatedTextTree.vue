<template>
  <template v-if="typeof node === 'string'">{{ node }}</template>
  <component
    v-else
    :is="itemTag"
    :class="itemClasses"
    :data-id="node.entity.id"
    :style="passageStyle"
    @click="onClick"
    @mouseenter="passage && emit('passageMouseenter', passage.clusterId, passage.passageId, $event)"
    @mouseleave="passage && emit('passageMouseleave', passage.clusterId, passage.passageId, $event)"
  >
    <AnnotatedTextTree
      v-for="(child, i) in node.children"
      :key="childKey(child, i)"
      :node="child"
      :cluster-colours="clusterColours"
      :selected-cluster-id="selectedClusterId"
      @cluster-selected="clusterId => emit('clusterSelected', clusterId)"
      @passage-clicked="(clusterId, passageId) => emit('passageClicked', clusterId, passageId)"
      @passage-mouseenter="
        (clusterId, passageId, e) => emit('passageMouseenter', clusterId, passageId, e)
      "
      @passage-mouseleave="
        (clusterId, passageId, e) => emit('passageMouseleave', clusterId, passageId, e)
      "
    />
    <template v-if="node.entity.kind === 'line'">
      <span
        v-for="borderlinePassage in borderlinePassages"
        :key="`${borderlinePassage.entity.id}-${borderlinePassage.isLast ? 'ending' : 'starting'}`"
        :title="getClusterTitle(borderlinePassage.entity.clusterId)"
        :class="['cluster-tag', borderlinePassage.isLast ? 'ending' : 'starting']"
        :style="clusterTagStyle(borderlinePassage.entity)"
        @click="emit('clusterSelected', String(borderlinePassage.entity.clusterId))"
      >
        <span class="select" :style="clusterInnerTagStyle(borderlinePassage.entity.clusterId)" />
      </span>
    </template>
    <span v-if="node.entity.kind === 'passage'" class="vertical-line" :style="verticalLineStyle" />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { getAnnotateTextTree } from '@/logic/articleAnnotations'

defineOptions({ name: 'AnnotatedTextTree' })

type TreeNode = ReturnType<typeof getAnnotateTextTree>['children'][number]

const props = defineProps<{
  node: TreeNode | string
  clusterColours?: Record<string, string>
  selectedClusterId?: string
}>()

const emit = defineEmits<{
  clusterSelected: [clusterId: string]
  passageClicked: [clusterId: string, passageId: string]
  passageMouseenter: [clusterId: string, passageId: string, e: MouseEvent]
  passageMouseleave: [clusterId: string, passageId: string, e: MouseEvent]
}>()

const passage = computed(() => {
  const n = props.node
  if (typeof n === 'string' || n.entity.kind !== 'passage') return null
  const { id, clusterId } = n.entity as { id: string; clusterId: string }
  return { passageId: String(id), clusterId: String(clusterId) }
})

const isSelected = computed(
  () => !!passage.value && passage.value.clusterId === props.selectedClusterId
)

const passageStyle = computed(() =>
  passage.value ? { backgroundColor: props.clusterColours?.[passage.value.clusterId] } : undefined
)

const itemTag = computed(() => {
  if (typeof props.node === 'string') return 'span'
  switch (props.node.entity.kind) {
    case 'line':
      return 'p'
    case 'namedEntity':
    case 'passage':
      return 'span'
    default:
      return 'div'
  }
})

const itemClasses = computed(() => {
  if (typeof props.node === 'string') return undefined
  const { kind, type } = props.node.entity
  const continuation = props.node.isContinuation ? ' continuation' : ''

  if (kind === 'namedEntity') return `entity ${type}${continuation}`
  if (kind === 'passage') {
    return `tr-passage passage-link${continuation}${isSelected.value ? ' selected' : ''}`
  }
  return kind
})

function flattenChildrenDeep(children: (TreeNode | string)[]): TreeNode[] {
  return children.flatMap(child => {
    if (typeof child === 'string') return []
    return child.children.length ? [child, ...flattenChildrenDeep(child.children)] : [child]
  })
}

const borderlinePassages = computed(() => {
  if (typeof props.node === 'string' || props.node.entity.kind !== 'line') return []
  const passages = flattenChildrenDeep(props.node.children).filter(
    child => child.entity.kind === 'passage'
  )
  return passages.filter(child => !child.isLast && !child.isContinuation).concat(
    passages.filter(child => child.isLast)
  )
})

function clusterIndex(clusterId?: string) {
  return Object.keys(props.clusterColours ?? {}).indexOf(String(clusterId))
}

function clusterTagStyle(entity: TreeNode['entity']) {
  return {
    borderColor: props.clusterColours?.[String(entity.clusterId)],
    right: `${(clusterIndex(entity.clusterId) + 1) * 8}px`
  }
}

function clusterInnerTagStyle(clusterId?: string) {
  return {
    backgroundColor:
      props.selectedClusterId === String(clusterId)
        ? props.clusterColours?.[String(clusterId)]
        : 'transparent'
  }
}

function getClusterTitle(clusterId?: string) {
  return `${props.selectedClusterId === String(clusterId) ? 'unselect' : 'select'} this passage`
}

const verticalLineStyle = computed(() => {
  if (!passage.value) return undefined
  return {
    backgroundColor: props.clusterColours?.[passage.value.clusterId],
    right: `${(clusterIndex(passage.value.clusterId) + 1) * 8}px`
  }
})

function onClick(e: MouseEvent) {
  if (!passage.value) return
  e.stopPropagation()
  const { clusterId, passageId } = passage.value
  if (isSelected.value) emit('passageClicked', clusterId, passageId)
  else emit('clusterSelected', clusterId)
}

function childKey(child: TreeNode | string, i: string | number) {
  if (typeof child === 'string') return `t${i}`
  const { kind, offset } = child.entity
  return `${kind}-${offset.start}-${offset.end}`
}
</script>

<style scoped lang="scss">
.passage-link {
  cursor: pointer;
  border-radius: 2px;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(0.92);
  }

  &.selected {
    outline: 2px solid currentColor;
  }
}
</style>
