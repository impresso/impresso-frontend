<template>
  <template v-if="typeof node === 'string'">{{ node }}</template>
  <component
    v-else
    :is="node.entity.kind === 'region' ? 'p' : 'span'"
    :class="[
      node.entity.kind,
      {
        continuation: node.isContinuation,
        selected: isSelected,
        'passage-link': passage
      }
    ]"
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
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { getAnnotateTextTree } from '@/logic/articleAnnotations'

defineOptions({ name: 'AnnotatedTextTree' })

// derived from the existing function, so no new interface is declared
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

// ASSUMPTION: passage entities look like { kind: 'passage', id, clusterId }
const passage = computed(() => {
  const n = props.node
  if (typeof n === 'string' || n.entity.kind !== 'passage') return null
  const { id, clusterId } = n.entity as any
  return { passageId: String(id), clusterId: String(clusterId) }
})

const isSelected = computed(
  () => !!passage.value && passage.value.clusterId === props.selectedClusterId
)

const passageStyle = computed(() =>
  passage.value ? { backgroundColor: props.clusterColours?.[passage.value.clusterId] } : undefined
)

// ASSUMPTION: click on a passage selects its cluster, click on the selected one opens it
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
