<template>
  <span
    class="label"
    :class="[
      ...(label.classNames || []),
      contextClass,
      label.includePrecision ? precision : undefined
    ]"
  >
    <template v-for="(token, index) in label.tokens" :key="`token-${index}`">
      <template v-if="token.type === 'translation'">
        {{
          String($t(token.translationKey)).startsWith('buckets.')
            ? token.fallback
            : $t(token.translationKey)
        }}
      </template>
      <span v-else-if="token.html" v-html="token.value"></span>
      <template v-else>{{ token.value }}</template>
      <span v-if="index < label.tokens.length - 1" class="op or px-1">{{
        $t(label.operatorKey)
      }}</span>
    </template>
    <span v-if="label.hiddenCount > 0">{{ $t('items.hidden', { count: label.hiddenCount }) }}</span>
  </span>
</template>

<script setup lang="ts">
export type LabelToken =
  | {
      type: 'translation'
      translationKey: string
      fallback: string
    }
  | {
      type: 'text'
      value: string
      html?: boolean
    }

export interface SearchPillsItemLabelData {
  tokens: LabelToken[]
  operatorKey: string
  hiddenCount: number
  classNames: string[]
  includePrecision?: boolean
}

export interface SearchPillsItemLabelProps {
  label: SearchPillsItemLabelData
  contextClass?: string
  precision?: string
}

withDefaults(defineProps<SearchPillsItemLabelProps>(), {
  contextClass: undefined,
  precision: undefined
})
</script>
