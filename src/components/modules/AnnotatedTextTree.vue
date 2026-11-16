<template>
  <template v-if="typeof node === 'string'">{{ node }}</template>
  <component v-else :is="itemTag" :class="itemClasses" :data-id="node.entity.id" @click="onClick">
    <ItemSelector
      class="p-0"
      v-if="shouldShowItemSelector"
      :id="node.entity.id"
      :item="{
        id: node.entity.id,
        type: node.entity.type,
        label: itemLabel
      }"
      :type="node.entity.type"
      hideIcon
    >
      <Icon
        v-if="!itemClasses.includes('continuation')"
        :name="node.entity.type"
        :width="12"
        :height="12"
        :stroke-width="2"
      />
      <AnnotatedTextTree
        v-for="(child, i) in node.children"
        :key="childKey(child, i)"
        :node="child"
        :has-explore-access="hasExploreAccess"
      />
    </ItemSelector>
    <template v-else>
      <AnnotatedTextTree
        v-for="(child, i) in node.children"
        :key="childKey(child, i)"
        :node="child"
        :has-explore-access="hasExploreAccess"
      />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { getAnnotateTextTree } from '@/logic/articleAnnotations'
import Icon from '../base/Icon.vue'
import ItemSelector from './ItemSelector.vue'

defineOptions({ name: 'AnnotatedTextTree' })

type TreeNode = ReturnType<typeof getAnnotateTextTree>['children'][number]

const props = defineProps<{
  node: TreeNode | string
  hasExploreAccess?: boolean
}>()

const shouldShowItemSelector = computed(() => {
  if (typeof props.node === 'string') return false
  return props.node.entity.kind === 'namedEntity' && props.hasExploreAccess
})
const itemTag = computed(() => {
  if (typeof props.node === 'string') return 'span'
  if (props.node.entity.kind === 'line') return 'p'
  if (props.node.entity.kind === 'region') return 'div'
  return 'span'
})

const itemClasses = computed(() => {
  if (typeof props.node === 'string') return undefined
  const { kind, type } = props.node.entity
  const continuation = props.node.isContinuation ? ' continuation' : ''

  if (kind === 'namedEntity') return `entity ${type}${continuation}`
  return kind
})

const itemLabel = computed(() => {
  if (typeof props.node === 'string') return props.node
  if (!Array.isArray(props.node?.children)) return ''
  return props.node.children.map(child => (typeof child === 'string' ? child : '')).join('')
})

function onClick(e: MouseEvent) {
  if (typeof props.node !== 'string' && props.node.entity.kind === 'namedEntity') {
    e.stopPropagation()
  }
}

function childKey(child: TreeNode | string, i: string | number) {
  if (typeof child === 'string') return `t${i}`
  const { kind, offset } = child.entity
  return `${kind}-${offset.start}-${offset.end}`
}
</script>
