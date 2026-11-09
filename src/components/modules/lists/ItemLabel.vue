<template>
  <div v-if="!detailed" class="ItemLabel d-inline" :class="itemType">
    <template v-if="itemType === 'collection'">
      <b>{{ item.name }}</b>
      <span class="date small">{{ $t('created', { date: $d(item.creationDate, 'short') }) }}</span>
    </template>
    <template v-else-if="itemType === 'topic'">
      <span class="small-caps" v-if="item.language">{{ item.language }}</span>
      {{ item.label || item.id }}
    </template>
    <template v-else-if="isBucketType">
      {{ $t(`buckets.${itemType}.${item.id}`) }}
    </template>
    <TextReuseClusterLabel v-else-if="isCluster" :item="item" />
    <TextReusePassageLabel v-else-if="isPassage" :item="item" />
    <template v-else>{{ computedLabel }}</template>
    <!-- detailed type -->
    <span v-if="itemType === 'newspaper'" class="small-caps"
      >&nbsp;&middot; {{ $t('newspaper') }}</span
    >
  </div>
  <div v-else class="ItemLabel">
    <div v-if="type === 'topic'">
      <div>
        <label class="small-caps">{{ $t('topWordsInTopic') }}</label>
      </div>
      <div class="d-inline-block" v-if="item.label">{{ item.label }}</div>
      <div class="d-inline-block word" v-for="(word, idx) in topicItem.words" :key="idx">
        <span>{{ word.w }}</span>
        <span v-if="idx < topicItem.words.length - 1">&nbsp;&middot;&nbsp;</span>
      </div>
      <span class="small-caps"
        >&nbsp;({{ $t(`buckets.language.${item.language}`).toLowerCase() }})</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { FacetType } from '@/models'
import { Topic } from '@/models/generated/canonical'
import { computed } from 'vue'
import TextReuseClusterLabel from './TextReuseClusterLabel.vue'
import TextReusePassageLabel from './TextReusePassageLabel.vue'

defineOptions({ name: 'ItemLabel' })

const BUCKET_TYPES = new Set<string>([
  'type',
  'sourceType',
  'country',
  'language',
  'copyright',
  'dataDomain'
])
const PERMISSION_TYPES = new Set<string>([
  'permissionExplore',
  'permissionGetTranscript',
  'permissionGetImage'
])
const IMAGE_TYPES = new Set<string>([
  'imageVisualContent',
  'imageTechnique',
  'imageCommunicationGoal',
  'imageContentType'
])

const props = defineProps<{
  item: Record<string, any>
  label?: string
  type: FacetType | string
  detailed?: boolean
  mainLabelClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
}>()

const itemType = computed(() => String(props.item.type ?? props.type))
const isBucketType = computed(() => BUCKET_TYPES.has(itemType.value))
const topicItem = computed(() => props.item as Topic)

// an explicit item.label always wins over the text reuse summaries
const isCluster = computed(
  () => !props.item.label && props.type === 'textReuseCluster' && !!props.item.clusterSize
)
const isPassage = computed(() => !props.item.label && props.type === 'textReusePassage')

function resolveLabel(item: Record<string, any>, type: string) {
  if (item.label) return item.label
  if (type === 'textReuseCluster') return item.id // cluster without clusterSize
  if (PERMISSION_TYPES.has(type)) return item.title
  if (type === 'year') return item.y
  if (IMAGE_TYPES.has(type)) return item.id
  if (typeof item.name === 'string' && item.name.length) return item.name
  return item.id
}

// plain text only: the HTML-producing summaries live in their own components
const computedLabel = computed(() => {
  const text = resolveLabel(props.item, props.type)
  return text != '' ? text : (props.label ?? '')
})
</script>

<style lang="css"></style>
<i18n lang="json">
{
  "en": {
    "created": "created on {date}",
    "newspaper": "newspaper",
    "topWordsInTopic": "top words in topic"
  }
}
</i18n>
