<template>
  <div class="TextReusePassageItemLabel">
    <h3 class="font-size-inherit m-0">
      <span class="small sans">Passage in:&nbsp;</span>
      <RouterLink class="font-weight-bold text-decoration-underline" :to="contentItemRoute">{{
        item.title
      }}</RouterLink>
    </h3>

    <RouterLink class="font-weight-bold text-decoration-underline small" :to="newspaperRoute">
      {{ newspaperName }}
    </RouterLink>

    <ItemSelector
      v-if="item.newspaper"
      :uid="item.newspaper.id"
      :item="{
        ...item.newspaper,
        uid: item.newspaper.id
      }"
      type="newspaper"
    />
    <span class="small ml-2">
      {{ $d(new Date(item.date), 'short') }} &ndash;
      {{ $tc('pp', item.pageNumbers.length, { pages: item.pageNumbers.join(',') }) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ItemSelector from '../ItemSelector.vue'

export interface Props {
  item: any
}

const props = withDefaults(defineProps<Props>(), {
  item: null
})

const newspaperName = computed(() => {
  if (!props.item.newspaper) {
    console.warn('No newspaper found for item', props.item)
    return '-'
  }
  if (props.item.newspaper.name) {
    return props.item.newspaper.name
  }
  if ((window as any).impressoNewspapers) {
    const newspaper = (window as any).impressoNewspapers[props.item.newspaper.id]
    if (newspaper) {
      return newspaper.name
    }
  }
  console.warn('No newspaper found in cache for item', props.item)
  return '-'
})

const contentItemRoute = computed(() => {
  const p = props.item.pageNumbers[0]
  const articleId = props.item.article.id.match(/-([i0-9]+$)/)[1]

  return {
    name: 'issue-viewer',
    params: {
      issue_uid: props.item.issue.id
    },
    query: {
      p,
      articleId,
      text: 1
    }
  }
})

const newspaperRoute = computed(() => {
  // Temporary bug fix
  // for instance, La Sentinelle doesn't have the newspaper id :)
  const newspaperUid = props.item.newspaper.id
    ? props.item.newspaper.id
    : props.item.article.id.match(/^([^-]+)/)[1]

  if (!newspaperUid) {
    console.error('No newspaper id found for item', props.item)
    return null
  }
  return {
    name: 'newspaper',
    params: {
      newspaper_uid: newspaperUid
    }
  }
})
</script>
<style>
.bg-dark .TextReusePassageItemLabel h3,
.bg-dark .TextReusePassageItemLabel span,
.bg-dark .TextReusePassageItemLabel a {
  color: var(--clr-white);
}
</style>
